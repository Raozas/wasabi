import { useEffect, useState } from 'react'
import { listProductsPage, listPublicProductsPage } from '../services/firestore/products'

export function useProducts(options = {}) {
  const {
    category,
    page = 1,
    pageSize = 24,
    publicOnly = false,
    statusFilter = 'all',
  } = options
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    hasNextPage: false,
    hasPreviousPage: false,
    page: 1,
    pageSize,
    totalCount: 0,
    totalPages: 0,
  })

  useEffect(() => {
    let cancelled = false

    async function loadProducts() {
      setLoading(true)
      setError('')

      try {
        const result = publicOnly
          ? await listPublicProductsPage({
              category,
              page,
              pageSize,
            })
          : await listProductsPage({
              category,
              page,
              pageSize,
              statusFilter,
            })

        if (!cancelled) {
          setPagination({
            hasNextPage: result.hasNextPage,
            hasPreviousPage: result.hasPreviousPage,
            page: result.page,
            pageSize: result.pageSize,
            totalCount: result.totalCount,
            totalPages: result.totalPages,
          })
          setProducts(result.items)
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
  }, [category, page, pageSize, publicOnly, statusFilter])

  return {
    error,
    hasNextPage: pagination.hasNextPage,
    hasPreviousPage: pagination.hasPreviousPage,
    loading,
    page: pagination.page,
    pageSize: pagination.pageSize,
    products,
    totalCount: pagination.totalCount,
    totalPages: pagination.totalPages,
  }
}
