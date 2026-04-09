import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
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

export async function listProducts() {
  const snapshot = await getDocs(query(productsCollection(), orderBy('createdAt', 'desc')))
  return snapshot.docs.map(mapProductSnapshot)
}

export async function listPublicProducts() {
  const products = await listProducts()
  return products.filter((product) => isPublicProduct(product))
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
