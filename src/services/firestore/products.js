import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
} from 'firebase/firestore'
import { COLLECTIONS } from '../../config/firebase-schema'
import {
  createNewProductDocument,
  createProductUpdateDocument,
} from '../../features/products/product.model'
import { isPublicProduct } from '../../features/products/product.utils'
import { ensureFirebaseService, timestampToDate } from '../../utils/firebase'
import { db } from '../firebase'

function productsCollection() {
  return collection(ensureFirebaseService(db, 'Firestore'), COLLECTIONS.products)
}

function productDocument(productId) {
  return doc(ensureFirebaseService(db, 'Firestore'), COLLECTIONS.products, productId)
}

function mapProductSnapshot(snapshot) {
  const data = snapshot.data()

  return {
    id: snapshot.id,
    ...data,
    createdAt: timestampToDate(data.createdAt),
    updatedAt: timestampToDate(data.updatedAt),
  }
}

function normalizePage(page) {
  const parsedPage = Number(page)

  if (!Number.isInteger(parsedPage) || parsedPage < 1) {
    return 1
  }

  return parsedPage
}

function normalizePageSize(pageSize, fallback = 24) {
  const parsedPageSize = Number(pageSize)

  if (!Number.isInteger(parsedPageSize) || parsedPageSize < 1) {
    return fallback
  }

  return Math.min(parsedPageSize, 100)
}

function normalizeStatusFilter(statusFilter) {
  return ['all', 'hidden', 'live'].includes(statusFilter) ? statusFilter : 'all'
}

function normalizeCategory(category) {
  const normalizedCategory = String(category ?? '').trim()
  return normalizedCategory && normalizedCategory !== 'all' ? normalizedCategory : ''
}

function buildProductFilterConstraints(options = {}) {
  const { category } = options
  const constraints = []
  const statusFilter = normalizeStatusFilter(options.statusFilter)

  if (statusFilter === 'live') {
    constraints.push(where('isAvailable', '==', true))
  } else if (statusFilter === 'hidden') {
    constraints.push(where('isAvailable', '==', false))
  }

  const normalizedCategory = normalizeCategory(category)

  if (normalizedCategory) {
    constraints.push(where('category', '==', normalizedCategory))
  }

  return constraints
}

function buildCountQuery(options = {}) {
  return query(productsCollection(), ...buildProductFilterConstraints(options))
}

function buildPageQuery(options = {}) {
  const constraints = [
    ...buildProductFilterConstraints(options),
    orderBy('createdAt', 'desc'),
  ]

  if (options.cursor) {
    constraints.push(startAfter(options.cursor))
  }

  constraints.push(limit(options.pageSize))
  return query(productsCollection(), ...constraints)
}

async function resolvePageCursor(options) {
  const { page, pageSize } = options
  let cursor = null

  for (let currentPage = 1; currentPage < page; currentPage += 1) {
    const snapshot = await getDocs(
      buildPageQuery({
        ...options,
        cursor,
        pageSize,
      }),
    )

    if (snapshot.docs.length === 0) {
      return null
    }

    cursor = snapshot.docs[snapshot.docs.length - 1]
  }

  return cursor
}

async function listPaginatedProducts(options = {}) {
  const pageSize = normalizePageSize(options.pageSize)
  const requestedPage = normalizePage(options.page)

  if (options.publicOnly) {
    const snapshot = await getDocs(query(productsCollection(), orderBy('createdAt', 'desc')))
    const normalizedCategory = normalizeCategory(options.category)
    const publicProducts = snapshot.docs
      .map(mapProductSnapshot)
      .filter((product) => isPublicProduct(product))
      .filter((product) => !normalizedCategory || product.category === normalizedCategory)
    const totalCount = publicProducts.length
    const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize)
    const page = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages)
    const startIndex = (page - 1) * pageSize
    const items = publicProducts.slice(startIndex, startIndex + pageSize)

    return {
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      items,
      page,
      pageSize,
      totalCount,
      totalPages,
    }
  }

  const totalCountSnapshot = await getCountFromServer(buildCountQuery(options))
  const totalCount = totalCountSnapshot.data().count
  const totalPages = totalCount === 0 ? 0 : Math.ceil(totalCount / pageSize)
  const page = totalPages === 0 ? 1 : Math.min(requestedPage, totalPages)

  if (totalCount === 0) {
    return {
      hasNextPage: false,
      hasPreviousPage: false,
      items: [],
      page,
      pageSize,
      totalCount,
      totalPages,
    }
  }

  const cursor = await resolvePageCursor({
    ...options,
    page,
    pageSize,
  })

  const snapshot = await getDocs(
    buildPageQuery({
      ...options,
      cursor,
      pageSize,
    }),
  )

  return {
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    items: snapshot.docs.map(mapProductSnapshot),
    page,
    pageSize,
    totalCount,
    totalPages,
  }
}

export async function listProducts() {
  const snapshot = await getDocs(query(productsCollection(), orderBy('createdAt', 'desc')))
  return snapshot.docs.map(mapProductSnapshot)
}

export async function listPublicProducts() {
  const products = await listProducts()
  return products.filter((product) => isPublicProduct(product))
}

export async function listProductsPage(options = {}) {
  return listPaginatedProducts(options)
}

export async function listPublicProductsPage(options = {}) {
  return listPaginatedProducts({
    ...options,
    publicOnly: true,
  })
}

export async function getProductCountsSummary() {
  const [totalSnapshot, liveSnapshot, hiddenSnapshot] = await Promise.all([
    getCountFromServer(buildCountQuery({ statusFilter: 'all' })),
    getCountFromServer(buildCountQuery({ statusFilter: 'live' })),
    getCountFromServer(buildCountQuery({ statusFilter: 'hidden' })),
  ])

  return {
    hiddenCount: hiddenSnapshot.data().count,
    liveCount: liveSnapshot.data().count,
    totalCount: totalSnapshot.data().count,
  }
}

export async function getProductById(productId) {
  const snapshot = await getDoc(productDocument(productId))
  return snapshot.exists() ? mapProductSnapshot(snapshot) : null
}

export async function createProduct(input) {
  const documentRef = await addDoc(productsCollection(), createNewProductDocument(input))
  return getProductById(documentRef.id)
}

export async function importProducts(rows) {
  const results = {
    createdCount: 0,
    errors: [],
    failedCount: 0,
  }

  for (const row of rows) {
    if (row.error) {
      results.errors.push({
        message: row.error,
        row: row.row,
        rowNumber: row.rowNumber,
      })
      continue
    }

    try {
      await createProduct(row.payload)
      results.createdCount += 1
    } catch (error) {
      results.errors.push({
        message: error instanceof Error ? error.message : 'Failed to import row.',
        row: row.row,
        rowNumber: row.rowNumber,
      })
    }
  }

  results.failedCount = results.errors.length
  return results
}

export async function updateProduct(productId, input) {
  await updateDoc(productDocument(productId), createProductUpdateDocument(input))
  return getProductById(productId)
}

export async function deleteProduct(productId) {
  await deleteDoc(productDocument(productId))
}
