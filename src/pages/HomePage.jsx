import { Button, Card, Chip, Separator, Spinner } from '@heroui/react'
import { ArrowRight, Package, ShoppingBag, Sparkle } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { ProductCatalogSection } from '../components/products/ProductCatalogSection'
import heroImage from '../assets/hero.png'
import { splitHomeSections } from '../features/products/home-sections'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import styles from './HomePage.module.css'

export function HomePage() {
  const navigate = useNavigate()
  const { totalItems } = useCart()
  const { error, loading, products } = useProducts({ publicOnly: true })
  const { allProducts, bestSelling } = splitHomeSections(products)

  return (
    <section className={styles.page}>
      <Card className={styles.hero}>
        <Card.Content className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <Chip className={styles.badge} color="primary" variant="flat">
              <Sparkle size={16} weight="fill" />
              Public storefront
            </Chip>
            <h2 className={styles.heading}>Logo and text for a cleaner top-first storefront</h2>
            <p className={styles.lead}>
              The public experience now starts with a horizontal navigation pattern and a larger
              landing block that highlights the brand, the shopping flow, and the featured catalog.
            </p>
            <div className={styles.actions}>
              <Button
                color="primary"
                size="lg"
                startContent={<Package size={18} weight="bold" />}
                onClick={() => navigate('/products')}
              >
                View full catalog
              </Button>
              <Button
                variant="bordered"
                size="lg"
                startContent={<ShoppingBag size={16} weight="duotone" />}
                onClick={() => navigate('/basket')}
              >
                Basket {totalItems > 0 ? `(${totalItems})` : ''}
              </Button>
              <Chip className={styles.secondaryAction} variant="bordered">
                <Sparkle size={16} weight="duotone" />
                {loading ? 'Loading catalog...' : `${products.length} products available`}
              </Chip>
            </div>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroCircle} />
            <img src={heroImage} alt="Wasabi storefront hero" className={styles.heroImage} />
          </div>
        </Card.Content>
      </Card>

      {loading && products.length === 0 ? (
        <div className={styles.loadingState}>
          <Spinner size="sm" />
          Loading homepage products...
        </div>
      ) : null}

      <ProductCatalogSection
        title="Best selling"
        description="A top row of products surfaced from the public catalog using a stable storefront sort."
        products={bestSelling}
        gridSize="small"
        loading={loading}
        error={error}
        emptyMessage="No best selling products are available yet."
        ctaLabel="Browse catalog"
        ctaTo="/products"
        ctaIcon={<ArrowRight size={18} weight="bold" />}
      />

      <ProductCatalogSection
        title="Our products"
        description="More live products from the storefront catalog."
        products={allProducts.length > 0 ? allProducts : bestSelling}
        gridSize="small"
        loading={loading}
        error={error}
        emptyMessage="No products are available yet."
        ctaLabel="Open products"
        ctaTo="/products"
        ctaIcon={<ArrowRight size={18} weight="bold" />}
      />

      <Card className={styles.companyInfo}>
        <Card.Content className={styles.companyContent}>
          <Separator />
          <div>
            <p className={styles.companyKicker}>Company info</p>
            <h3>Built for a direct storefront conversation</h3>
            <p>
              Wasabi Shop keeps catalog browsing public and simple, while ordering flows continue
              into direct messaging so admins can confirm details quickly.
            </p>
          </div>
        </Card.Content>
      </Card>
    </section>
  )
}
