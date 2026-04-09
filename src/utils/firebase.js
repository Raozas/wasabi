export function ensureFirebaseService(service, serviceName) {
  if (!service) {
    throw new Error(`${serviceName} is not initialized. Add the Firebase environment variables first.`)
  }

  return service
}

export function timestampToDate(value) {
  if (!value) {
    return null
  }

  if (typeof value.toDate === 'function') {
    return value.toDate()
  }

  return value instanceof Date ? value : null
}
