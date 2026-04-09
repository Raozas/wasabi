import { serverTimestamp } from 'firebase/firestore'
import { ADMIN_ROLES } from '../../config/firebase-schema'

const VALID_ROLES = new Set(Object.values(ADMIN_ROLES))

function normalizeRole(role) {
  const nextRole = String(role ?? ADMIN_ROLES.admin).trim()

  if (!VALID_ROLES.has(nextRole)) {
    throw new Error(`Invalid admin role "${nextRole}".`)
  }

  return nextRole
}

function buildAdminFieldValue(key, value) {
  if (key === 'role') {
    return normalizeRole(value)
  }

  if (key === 'isActive') {
    return Boolean(value)
  }

  return String(value ?? '').trim()
}

const DEFAULT_ADMIN_VALUES = {
  uid: '',
  name: '',
  email: '',
  role: ADMIN_ROLES.admin,
  isActive: true,
}

export function createAdminUserPayload(input, options = {}) {
  const { partial = false } = options
  const payload = {}

  for (const [key, fallbackValue] of Object.entries(DEFAULT_ADMIN_VALUES)) {
    if (partial && !(key in input)) {
      continue
    }

    const nextValue = key in input ? input[key] : fallbackValue
    payload[key] = buildAdminFieldValue(key, nextValue)
  }

  return payload
}

export function createAdminUserDocument(input) {
  return {
    ...createAdminUserPayload(input),
    createdAt: serverTimestamp(),
  }
}
