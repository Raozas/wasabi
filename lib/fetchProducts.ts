import 'dotenv/config'
import {
  ALLOWED_PRODUCT_CATEGORIES,
  type FetchProductsParams,
  type FetchProductsResponse,
  type Product,
  type ProductCategory,
  type ProductPrices,
  type ProductStock,
  type ProductsApiConfig,
} from '../types/products'

const CATEGORY_SET = new Set<ProductCategory>(ALLOWED_PRODUCT_CATEGORIES)
const DEFAULT_AUTH_MODE = 'Bearer'

function maskToken(token: string): string {
  if (!token) {
    return '[empty]'
  }

  if (token.length <= 8) {
    return `${token.slice(0, 2)}...${token.slice(-2)}`
  }

  return `${token.slice(0, 4)}...${token.slice(-4)}`
}

function logRequestDebug(url: string, config: ProductsApiConfig): void {
  console.log('[fetchProducts] Request debug:')
  console.log(`  url: ${url}`)
  console.log(`  authMode: "${config.authMode}"`)
  console.log(`  tokenPresent: ${config.token.length > 0}`)
  console.log(`  tokenLength: ${config.token.length}`)
  console.log(`  maskedToken: ${maskToken(config.token)}`)
  console.log(`  authorizationHeader: "${config.authMode} ${maskToken(config.token)}"`)
}

export class ProductsApiError extends Error {
  readonly status: number
  readonly statusText: string
  readonly url: string
  readonly responseBody: unknown

  constructor(
    message: string,
    options: { status: number; statusText: string; url: string; responseBody: unknown },
  ) {
    super(message)
    this.name = 'ProductsApiError'
    this.status = options.status
    this.statusText = options.statusText
    this.url = options.url
    this.responseBody = options.responseBody
  }
}

export function readProductsApiConfig(): ProductsApiConfig {
  const endpoint = process.env.API_ENDPOINT?.trim() ?? ''
  const token = process.env.API_TOKEN?.trim() ?? ''
  const authMode = process.env.AUTH_MODE?.trim() || DEFAULT_AUTH_MODE

  if (!endpoint) {
    throw new Error('Missing API_ENDPOINT in .env.')
  }

  if (!token) {
    throw new Error('Missing API_TOKEN in .env.')
  }

  return { endpoint, token, authMode }
}

export function validateCategories(categories?: string[]): ProductCategory[] | undefined {
  if (!categories || categories.length === 0) {
    return undefined
  }

  const normalizedCategories = categories.map((category) => category.trim()).filter(Boolean)

  for (const category of normalizedCategories) {
    if (!CATEGORY_SET.has(category as ProductCategory)) {
      throw new Error(
        `Invalid category "${category}". Allowed categories: ${ALLOWED_PRODUCT_CATEGORIES.join(', ')}.`,
      )
    }
  }

  return normalizedCategories as ProductCategory[]
}

export function validateLimit(limit?: number): number | undefined {
  if (typeof limit === 'undefined') {
    return undefined
  }

  if (!Number.isInteger(limit) || limit < 1 || limit > 500) {
    throw new Error('The "limit" query param must be an integer between 1 and 500.')
  }

  return limit
}

export function validateOffset(offset?: number): number | undefined {
  if (typeof offset === 'undefined') {
    return undefined
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new Error('The "offset" query param must be a non-negative integer.')
  }

  return offset
}

export function buildProductsQueryString(params: FetchProductsParams = {}): string {
  const categories = validateCategories(params.categories)
  const limit = validateLimit(params.limit)
  const offset = validateOffset(params.offset)
  const searchParams = new URLSearchParams()

  if (typeof params.in_stock_only === 'boolean') {
    searchParams.set('in_stock_only', String(params.in_stock_only))
  }

  if (categories && categories.length > 0) {
    searchParams.set('categories', categories.join(','))
  }

  if (typeof limit === 'number') {
    searchParams.set('limit', String(limit))
  }

  if (typeof offset === 'number') {
    searchParams.set('offset', String(offset))
  }

  return searchParams.toString()
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function parseProductStock(value: unknown): ProductStock {
  const input = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  const stock: ProductStock = { total: toNumber(input.total) }

  for (const [key, entryValue] of Object.entries(input)) {
    stock[key] = toNumber(entryValue)
  }

  return stock
}

function parseProductPrices(value: unknown): ProductPrices {
  const input = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {}
  const prices: ProductPrices = { default: toNumber(input.default) }

  for (const [key, entryValue] of Object.entries(input)) {
    prices[key] = toNumber(entryValue)
  }

  return prices
}

function parseProduct(item: unknown): Product {
  const input = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {}
  const category = String(input.category ?? '__uncategorized__').trim() || '__uncategorized__'

  if (!CATEGORY_SET.has(category as ProductCategory)) {
    throw new Error(`External API returned unsupported category "${category}".`)
  }

  return {
    id: String(input.id ?? '').trim(),
    name: String(input.name ?? '').trim(),
    barcode: String(input.barcode ?? '').trim(),
    image_url: String(input.image_url ?? '').trim(),
    category: category as ProductCategory,
    subcategory: String(input.subcategory ?? '').trim(),
    stock: parseProductStock(input.stock),
    prices: parseProductPrices(input.prices),
  }
}

function parseCategories(value: unknown): ProductCategory[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map((category) => String(category).trim())
    .filter((category): category is ProductCategory => CATEGORY_SET.has(category as ProductCategory))
}

function parseResponsePayload(payload: unknown): FetchProductsResponse {
  const input = typeof payload === 'object' && payload !== null ? (payload as Record<string, unknown>) : {}
  const items = Array.isArray(input.items) ? input.items.map(parseProduct) : []

  return {
    items,
    total: toNumber(input.total, items.length),
    limit: toNumber(input.limit, items.length),
    offset: toNumber(input.offset),
    in_stock_only: Boolean(input.in_stock_only),
    categories: parseCategories(input.categories),
    available_categories: parseCategories(input.available_categories),
  }
}

async function parseErrorBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? ''

  try {
    if (contentType.includes('application/json')) {
      return await response.json()
    }

    return await response.text()
  } catch {
    return null
  }
}

export async function fetchProducts(
  params: FetchProductsParams = {},
  config: ProductsApiConfig = readProductsApiConfig(),
): Promise<FetchProductsResponse> {
  const queryString = buildProductsQueryString(params)
  const url = queryString ? `${config.endpoint}?${queryString}` : config.endpoint

  logRequestDebug(url, config)

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `${config.authMode} ${config.token}`,
    },
  })

  if (!response.ok) {
    const responseBody = await parseErrorBody(response)
    throw new ProductsApiError(
      `External products API request failed with ${response.status} ${response.statusText}.`,
      {
        status: response.status,
        statusText: response.statusText,
        url,
        responseBody,
      },
    )
  }

  const payload = await response.json()
  return parseResponsePayload(payload)
}
