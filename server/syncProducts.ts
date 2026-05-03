import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { Timestamp } from 'firebase-admin/firestore'
import { fetchProducts } from '../lib/fetchProducts'
import { adminDb } from './firebaseAdmin'

const PRODUCTS_COLLECTION = 'products'
const PAGE_LIMIT = 500
const DEFAULT_DESCRIPTION = 'Imported from supplier inventory.'

type FirestoreProduct = {
  barcode?: string
  category?: string
  isAvailable?: boolean
  name?: string
  photoUrl?: string
  price?: number
  shortDescription?: string
}

export type ProductSyncSummary = {
  createdCount: number
  fetchedCount: number
  skippedCount: number
  updatedCount: number
}

function normalizeText(value: unknown): string {
  return String(value ?? '').trim()
}

function normalizeNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function getExternalPrice(prices: Record<string, number> | undefined): number {
  if (!prices || typeof prices !== 'object') {
    return 0
  }

  if (Number.isFinite(Number(prices.default))) {
    return Number(prices.default)
  }

  const fallbackValue = Object.values(prices).find((value) => Number.isFinite(Number(value)))
  return fallbackValue ? Number(fallbackValue) : 0
}

function buildSyncedProduct(existingProduct: FirestoreProduct | null, externalProduct: any) {
  const existingDescription = normalizeText(existingProduct?.shortDescription)

  return {
    barcode: normalizeText(externalProduct.barcode),
    category: normalizeText(externalProduct.category) || '__uncategorized__',
    externalProductId: normalizeText(externalProduct.id),
    imageUrl: normalizeText(externalProduct.image_url),
    isAvailable: normalizeNumber(externalProduct.stock?.total, 0) > 0,
    name: normalizeText(externalProduct.name) || normalizeText(existingProduct?.name) || 'Unnamed product',
    photoUrl:
      normalizeText(externalProduct.image_url) || normalizeText(existingProduct?.photoUrl),
    price: getExternalPrice(externalProduct.prices),
    prices: externalProduct.prices ?? {},
    shortDescription: existingDescription || DEFAULT_DESCRIPTION,
    stock: externalProduct.stock ?? { total: 0 },
    subcategory: normalizeText(externalProduct.subcategory),
    syncedAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }
}

async function fetchAllProducts() {
  const items = []
  let offset = 0
  let total = Number.POSITIVE_INFINITY

  while (items.length < total) {
    const page = await fetchProducts({
      in_stock_only: false,
      limit: PAGE_LIMIT,
      offset,
    })

    items.push(...page.items)
    total = Number.isFinite(page.total) ? page.total : items.length

    if (page.items.length === 0 || page.items.length < page.limit) {
      break
    }

    offset += page.limit
  }

  return items
}

async function loadExistingProductsByBarcode() {
  const snapshot = await adminDb.collection(PRODUCTS_COLLECTION).get()
  const productsByBarcode = new Map<string, { id: string; data: FirestoreProduct }>()

  for (const document of snapshot.docs) {
    const data = document.data() as FirestoreProduct
    const barcode = normalizeText(data.barcode)

    if (!barcode) {
      continue
    }

    productsByBarcode.set(barcode, {
      id: document.id,
      data,
    })
  }

  return productsByBarcode
}

export async function syncProducts(): Promise<ProductSyncSummary> {
  const [externalProducts, existingProductsByBarcode] = await Promise.all([
    fetchAllProducts(),
    loadExistingProductsByBarcode(),
  ])

  let createdCount = 0
  let updatedCount = 0
  let skippedCount = 0
  let batch = adminDb.batch()
  let batchOperations = 0

  async function commitBatch() {
    if (batchOperations === 0) {
      return
    }

    await batch.commit()
    batch = adminDb.batch()
    batchOperations = 0
  }

  for (const externalProduct of externalProducts) {
    const barcode = normalizeText(externalProduct.barcode)

    if (!barcode) {
      skippedCount += 1
      continue
    }

    const existingProduct = existingProductsByBarcode.get(barcode) ?? null
    const syncedProduct = buildSyncedProduct(existingProduct?.data ?? null, externalProduct)

    if (existingProduct) {
      const documentRef = adminDb.collection(PRODUCTS_COLLECTION).doc(existingProduct.id)
      batch.set(documentRef, syncedProduct, { merge: true })
      updatedCount += 1
    } else {
      const documentRef = adminDb.collection(PRODUCTS_COLLECTION).doc()
      batch.set(documentRef, {
        ...syncedProduct,
        createdAt: Timestamp.now(),
      })
      createdCount += 1
    }

    batchOperations += 1

    if (batchOperations >= 400) {
      await commitBatch()
    }
  }

  await commitBatch()

  return {
    createdCount,
    fetchedCount: externalProducts.length,
    skippedCount,
    updatedCount,
  }
}

async function main() {
  const summary = await syncProducts()
  console.log(JSON.stringify(summary, null, 2))
}

const currentFilePath = fileURLToPath(import.meta.url)

if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  void main()
}
