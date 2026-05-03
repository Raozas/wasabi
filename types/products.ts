export const ALLOWED_PRODUCT_CATEGORIES = [
  '__uncategorized__',
  'food',
  'sweets',
  'drinks',
  'cosmetics',
  'supplements',
  'toys',
  'household',
  'gifts',
] as const

export type ProductCategory = (typeof ALLOWED_PRODUCT_CATEGORIES)[number]

export type ProductSubcategory = string

export interface ProductStock {
  total: number
  [locationKey: string]: number
}

export interface ProductPrices {
  default: number
  [priceKey: string]: number
}

export interface Product {
  id: string
  name: string
  barcode: string
  image_url: string
  category: ProductCategory
  subcategory: ProductSubcategory
  stock: ProductStock
  prices: ProductPrices
}

export interface FetchProductsParams {
  in_stock_only?: boolean
  categories?: ProductCategory[]
  limit?: number
  offset?: number
}

export interface FetchProductsResponse {
  items: Product[]
  total: number
  limit: number
  offset: number
  in_stock_only: boolean
  categories: ProductCategory[]
  available_categories: ProductCategory[]
}

export interface ProductsApiConfig {
  endpoint: string
  token: string
  authMode: string
}
