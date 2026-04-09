export function isProductValid(product) {
  if (!product) {
    return false
  }

  const hasName = typeof product.name === 'string' && product.name.trim().length > 0
  const hasCategory = typeof product.category === 'string' && product.category.trim().length > 0
  const hasDescription =
    typeof product.shortDescription === 'string' && product.shortDescription.trim().length > 0
  const hasPhoto = typeof product.photoUrl === 'string' && product.photoUrl.trim().length > 0
  const hasValidPrice = typeof product.price === 'number' && Number.isFinite(product.price)

  return hasName && hasCategory && hasDescription && hasPhoto && hasValidPrice
}

export function isPublicProduct(product) {
  return isProductValid(product) && product.isAvailable === true
}

export function formatPrice(price, currency = 'UZS', locale = 'uz-UZ') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price)
}
