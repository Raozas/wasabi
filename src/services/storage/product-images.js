import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { STORAGE_BUCKETS } from '../../config/firebase-schema'
import { ensureFirebaseService } from '../../utils/firebase'
import { storage } from '../firebase'

function sanitizeFileName(fileName) {
  return fileName.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase()
}

export function createProductImagePath(productId, fileName) {
  const safeProductId = String(productId).trim()
  const safeFileName = sanitizeFileName(fileName)
  return `${STORAGE_BUCKETS.productImages}/${safeProductId}/${Date.now()}-${safeFileName}`
}

export async function uploadProductImage({ file, productId }) {
  const storageService = ensureFirebaseService(storage, 'Firebase Storage')
  const imagePath = createProductImagePath(productId, file.name)
  const storageRef = ref(storageService, imagePath)

  await uploadBytes(storageRef, file, {
    cacheControl: 'public,max-age=3600',
    contentType: file.type,
  })

  const downloadUrl = await getDownloadURL(storageRef)

  return {
    path: imagePath,
    photoUrl: downloadUrl,
  }
}

export async function deleteProductImage(imagePath) {
  const storageService = ensureFirebaseService(storage, 'Firebase Storage')
  await deleteObject(ref(storageService, imagePath))
}
