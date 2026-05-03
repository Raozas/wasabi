import { ShoppingCartSimple } from '@phosphor-icons/react'
import { useMemo } from 'react'
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
  const { error, loading, products } = useProducts({ publicOnly: true })
  const [searchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') ?? 'all'

  const categoryMeta = useMemo(() => {
    const counts = products.reduce((result, product) => {
      const category = String(product.category ?? '').trim()

      if (!category) {
        return result
      }

      result[category] = (result[category] ?? 0) + 1
      return result
    }, {})

    return Object.entries(counts)
      .map(([category, count]) => ({ category, count }))
      .sort((left, right) => left.category.localeCompare(right.category))
  }, [products])

  const activeCategory = useMemo(() => {
    if (selectedCategory === 'all') {
      return 'all'
    }

    return categoryMeta.some((item) => item.category === selectedCategory) ? selectedCategory : 'all'
  }, [categoryMeta, selectedCategory])

  const visibleProducts = useMemo(() => {
    if (activeCategory === 'all') {
      return products
    }

    return products.filter((product) => product.category === activeCategory)
  }, [activeCategory, products])

  return (
    <section className={styles.page}>
      <ProductCatalogSection
        title="Catalog"
        description="Filtered public products from the storefront inventory."
        products={visibleProducts}
        gridSize="small"
        loading={loading}
        error={error}
        emptyMessage={
          activeCategory === 'all'
            ? 'No public products are available yet.'
            : `No products are available in ${activeCategory} right now.`
        }
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
