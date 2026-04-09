import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { COLLECTIONS } from '../../config/firebase-schema'
import {
  createAdminUserDocument,
  createAdminUserPayload,
} from '../../features/admin-users/admin-user.model'
import { ensureFirebaseService, timestampToDate } from '../../utils/firebase'
import { db } from '../firebase'

function adminUsersCollection() {
  return collection(ensureFirebaseService(db, 'Firestore'), COLLECTIONS.adminUsers)
}

function adminUserDocument(uid) {
  return doc(ensureFirebaseService(db, 'Firestore'), COLLECTIONS.adminUsers, uid)
}

function mapAdminUserSnapshot(snapshot) {
  const data = snapshot.data()

  return {
    uid: snapshot.id,
    ...data,
    createdAt: timestampToDate(data.createdAt),
  }
}

export async function listAdminUsers() {
  const snapshot = await getDocs(query(adminUsersCollection(), orderBy('createdAt', 'desc')))
  return snapshot.docs.map(mapAdminUserSnapshot)
}

export async function getAdminUserByUid(uid) {
  const snapshot = await getDoc(adminUserDocument(uid))
  return snapshot.exists() ? mapAdminUserSnapshot(snapshot) : null
}

export async function createAdminUser(input) {
  const payload = createAdminUserDocument(input)
  await setDoc(adminUserDocument(payload.uid), payload)
  return getAdminUserByUid(payload.uid)
}

export async function updateAdminUser(uid, input) {
  await updateDoc(adminUserDocument(uid), createAdminUserPayload(input, { partial: true }))
  return getAdminUserByUid(uid)
}

export async function updateAdminUserRole(uid, role) {
  await updateDoc(adminUserDocument(uid), { role })
  return getAdminUserByUid(uid)
}

export async function setAdminUserStatus(uid, isActive) {
  await updateDoc(adminUserDocument(uid), { isActive })
  return getAdminUserByUid(uid)
}

export async function deleteAdminUser(uid) {
  await deleteDoc(adminUserDocument(uid))
}
