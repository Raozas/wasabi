import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { COLLECTIONS } from '../../config/firebase-schema'
import { createPurchaseRequestDocument } from '../../features/purchase-requests/purchase-request.model'
import { ensureFirebaseService, timestampToDate } from '../../utils/firebase'
import { db } from '../firebase'

function purchaseRequestsCollection() {
  return collection(ensureFirebaseService(db, 'Firestore'), COLLECTIONS.purchaseRequests)
}

function purchaseRequestDocument(requestId) {
  return doc(ensureFirebaseService(db, 'Firestore'), COLLECTIONS.purchaseRequests, requestId)
}

function mapPurchaseRequestSnapshot(snapshot) {
  const data = snapshot.data()

  return {
    id: snapshot.id,
    ...data,
    createdAt: timestampToDate(data.createdAt),
  }
}

export async function listPurchaseRequests() {
  const snapshot = await getDocs(query(purchaseRequestsCollection(), orderBy('createdAt', 'desc')))
  return snapshot.docs.map(mapPurchaseRequestSnapshot)
}

export async function createPurchaseRequest(input) {
  const documentRef = await addDoc(purchaseRequestsCollection(), createPurchaseRequestDocument(input))
  return documentRef.id
}

export async function updatePurchaseRequestStatus(requestId, status) {
  await updateDoc(purchaseRequestDocument(requestId), { status })
}
