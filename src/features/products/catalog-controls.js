export const CATALOG_CARD_SIZE_STORAGE_KEY = 'wasabi-catalog-card-size'

export const CATALOG_CARD_SIZE_OPTIONS = [
  { description: 'More products on screen', label: 'Compact', value: 'small' },
  { description: 'Balanced browsing layout', label: 'Comfortable', value: 'default' },
  { description: 'Larger cards with more space', label: 'Expanded', value: 'large' },
]

export function normalizeCatalogCardSize(value) {
  return ['small', 'default', 'large'].includes(value) ? value : 'default'
}

export function readStoredCatalogCardSize() {
  if (typeof window === 'undefined') {
    return 'default'
  }

  return normalizeCatalogCardSize(window.localStorage.getItem(CATALOG_CARD_SIZE_STORAGE_KEY))
}
