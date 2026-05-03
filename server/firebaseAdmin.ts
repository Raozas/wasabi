import 'dotenv/config'
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

function readRequiredEnv(name: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`Missing ${name} in .env.`)
  }

  return value
}

function getPrivateKey(): string {
  return readRequiredEnv('FIREBASE_ADMIN_PRIVATE_KEY').replace(/\\n/g, '\n')
}

function hasServiceAccountEnv(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID?.trim() &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL?.trim() &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY?.trim(),
  )
}

function initializeFirebaseAdmin() {
  if (getApps().length > 0) {
    return getApps()[0]
  }

  if (!hasServiceAccountEnv()) {
    return initializeApp({
      credential: applicationDefault(),
    })
  }

  return initializeApp({
    credential: cert({
      clientEmail: readRequiredEnv('FIREBASE_ADMIN_CLIENT_EMAIL'),
      privateKey: getPrivateKey(),
      projectId: readRequiredEnv('FIREBASE_ADMIN_PROJECT_ID'),
    }),
  })
}

const adminApp = initializeFirebaseAdmin()
const adminDb = getFirestore(adminApp)

export { adminDb }
