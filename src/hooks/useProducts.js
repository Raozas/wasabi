import { useEffect, useState } from 'react'
import { listProducts } from '../services/firestore/products'
import { isPublicProduct } from '../features/products/product.utils'

export function useProducts(options = {}) {
  const { publicOnly = false } = options
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setLoading(true)
      setError('')

      try {
        const nextProducts = await listProducts()
        const resolvedProducts = publicOnly
          ? nextProducts.filter((product) => isPublicProduct(product))
          : nextProducts

        if (!cancelled) {
          setProducts(resolvedProducts)
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : 'Failed to load products.')
          setProducts([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadProducts()

    return () => {
      cancelled = true
    }
  }, [publicOnly])

  return {
    error,
    loading,
    products,
  }
}
