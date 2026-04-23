import { Button, Card, Chip } from '@heroui/react'
import { ShoppingBag } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ProductCatalogSection } from '../components/products/ProductCatalogSection'
import {
  normalizeCatalogCardSize,
  readStoredCatalogCardSize,
} from '../features/products/catalog-controls'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import styles from './ProductListPage.module.css'

export function ProductListPage() {
  const navigate = useNavigate()
  const { totalItems } = useCart()
  const { error, loading, products } = useProducts({ publicOnly: true })
  const [searchParams] = useSearchParams()
  const selectedCategory = searchParams.get('category') ?? 'all'
  const cardSize = normalizeCatalogCardSize(searchParams.get('size') ?? readStoredCatalogCardSize())

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
      <Card className={styles.hero}>
        <Card.Content className={styles.heroContent}>
          <Chip className={styles.eyebrow} color="primary" variant="flat">
            Guest storefront
          </Chip>
          <h2 className={styles.title}>Browse available products</h2>
          <p className={styles.copy}>
            Explore the live catalog, jump into a category quickly, and choose a card size that
            feels best on your screen.
          </p>
          <Button
            className={styles.basketLink}
            variant="bordered"
            startContent={<ShoppingBag size={18} weight="duotone" />}
            onClick={() => navigate('/basket')}
          >
            Basket {totalItems > 0 ? `(${totalItems})` : ''}
          </Button>
        </Card.Content>
      </Card>

      <ProductCatalogSection
        title="Catalog"
        description="Filtered public products from the storefront inventory."
        products={visibleProducts}
        gridSize={cardSize}
        loading={loading}
        error={error}
        emptyMessage={
          activeCategory === 'all'
            ? 'No public products are available yet.'
            : `No products are available in ${activeCategory} right now.`
        }
      />
    </section>
  )
}
