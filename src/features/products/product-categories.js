export const PRODUCT_CATEGORY_OPTIONS = [
  'all',
  '__uncategorized__',
  'food',
  'sweets',
  'drinks',
  'cosmetics',
  'supplements',
  'toys',
  'household',
  'gifts',
]

export function formatProductCategoryLabel(category) {
  const normalizedCategory = String(category ?? '').trim()

  if (!normalizedCategory || normalizedCategory === 'all') {
    return 'All'
  }

  if (normalizedCategory === '__uncategorized__') {
    return 'Uncategorized'
  }

  return normalizedCategory
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}
