import { serverTimestamp } from 'firebase/firestore'

const DEFAULT_PRODUCT_VALUES = {
  barcode: '',
  category: '',
  isAvailable: true,
  name: '',
  photoUrl: '',
  price: 0,
  shortDescription: '',
}

function normalizePrice(price) {
  const parsedPrice = Number(price)

  if (Number.isNaN(parsedPrice)) {
    throw new Error('Product price must be a valid number.')
  }

  return parsedPrice
}

function buildFieldValue(input, key) {
  if (key === 'price') {
    return normalizePrice(input.price)
  }

  if (key === 'isAvailable') {
    return Boolean(input.isAvailable)
  }

  return String(input[key]).trim()
}

export function createProductPayload(input, options = {}) {
  const { partial = false } = options
  const payload = {}

  for (const [key, fallbackValue] of Object.entries(DEFAULT_PRODUCT_VALUES)) {
    if (partial && !(key in input)) {
      continue
    }

    const nextValue = key in input ? input[key] : fallbackValue
    payload[key] = buildFieldValue({ ...input, [key]: nextValue }, key)
  }

  return payload
}

export function createNewProductDocument(input) {
  return {
    ...createProductPayload(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }
}

export function createProductUpdateDocument(input) {
  return {
    ...createProductPayload(input, { partial: true }),
    updatedAt: serverTimestamp(),
  }
}
