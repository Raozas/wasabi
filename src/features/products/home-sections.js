export function splitHomeSections(products) {
  const sortedProducts = [...products].sort((left, right) =>
    String(left.name ?? '').localeCompare(String(right.name ?? '')),
  )

  return {
    bestSelling: sortedProducts.slice(0, 4),
    allProducts: sortedProducts.slice(4, 8),
  }
}
