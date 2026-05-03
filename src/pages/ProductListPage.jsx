import { ShoppingCartSimple } from '@phosphor-icons/react'
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ProductCatalogSection } from '../components/products/ProductCatalogSection'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import styles from './ProductListPage.module.css'

function joinClassNames(...values) {
  return values.filter(Boolean).join(' ')
}

export function ProductListPage() {
  const navigate = useNavigate()
  const { totalItems } = useCart()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedPage = Math.max(1, Number(searchParams.get('page') ?? 1) || 1)
  const selectedCategory = searchParams.get('category') ?? 'all'
  const { error, loading, page, products, totalCount, totalPages } = useProducts({
    category: selectedCategory === 'all' ? undefined : selectedCategory,
    page: requestedPage,
    pageSize: 24,
    publicOnly: true,
  })

  useEffect(() => {
    const shouldClampToFirstPage = !loading && totalPages === 0 && requestedPage !== 1
    const shouldClampToLastPage = !loading && totalPages > 0 && requestedPage > totalPages

    if (shouldClampToFirstPage || shouldClampToLastPage) {
      const nextSearchParams = new URLSearchParams(searchParams)

      if (page <= 1) {
        nextSearchParams.delete('page')
      } else {
        nextSearchParams.set('page', String(page))
      }

      setSearchParams(nextSearchParams)
    }
  }, [loading, page, requestedPage, searchParams, setSearchParams, totalPages])

  function handlePageChange(nextPage) {
    const nextSearchParams = new URLSearchParams(searchParams)

    if (nextPage <= 1) {
      nextSearchParams.delete('page')
    } else {
      nextSearchParams.set('page', String(nextPage))
    }

    const nextQueryString = nextSearchParams.toString()
    navigate(nextQueryString ? `/products?${nextQueryString}` : '/products')
  }

  return (
    <section className={styles.page}>
      <ProductCatalogSection
        title="Catalog"
        description="Filtered public products from the storefront inventory."
        products={products}
        gridSize="small"
        loading={loading}
        error={error}
        emptyMessage={
          selectedCategory === 'all'
            ? 'No public products are available yet.'
            : `No products are available in ${selectedCategory} right now.`
        }
        pagination={{
          currentPage: page,
          onPageChange: handlePageChange,
          totalCount,
          totalPages,
        }}
      />

      <button
        type="button"
        className={joinClassNames(
          styles.basketLink,
          totalItems > 0 ? styles.basketLinkActive : styles.basketLinkIdle,
        )}
        onClick={() => navigate('/basket')}
        aria-label={totalItems > 0 ? `Basket with ${totalItems} items` : 'Open basket'}
      >
        {totalItems > 0 ? (
          <>
            <ShoppingCartSimple size={30} weight="duotone" />
            <span className={styles.basketCount}>{totalItems}</span>
          </>
        ) : (
          <ShoppingCartSimple size={26} weight="duotone" />
        )}
      </button>
    </section>
  )
}
