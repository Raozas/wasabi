import { ArrowRight, Package, ShoppingBag, Sparkle } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { ProductCatalogSection } from '../components/products/ProductCatalogSection'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import styles from './HomePage.module.css'

export function HomePage() {
  const { totalItems } = useCart()
  const { error, loading, products } = useProducts({ publicOnly: true })
  const featuredProducts = products.slice(0, 3)

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.badge}>
          <Sparkle size={16} weight="fill" />
          Public storefront
        </span>
        <h2 className={styles.heading}>Browse curated products from the Wasabi catalog</h2>
        <p className={styles.lead}>
          Guests can now explore a responsive storefront powered by Firestore, with only public-ready
          products shown in the catalog.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primaryAction} to="/products">
            <Package size={18} weight="bold" />
            View full catalog
          </Link>
          <Link className={styles.secondaryLink} to="/basket">
            <ShoppingBag size={16} weight="duotone" />
            Basket {totalItems > 0 ? `(${totalItems})` : ''}
          </Link>
          <span className={styles.secondaryAction}>
            <Sparkle size={16} weight="duotone" />
            {loading ? 'Loading catalog...' : `${products.length} products available`}
          </span>
        </div>
      </div>

      <ProductCatalogSection
        title="Featured products"
        description="A storefront preview pulled from the live public catalog."
        products={featuredProducts}
        loading={loading}
        error={error}
        emptyMessage="No featured products are available yet."
        ctaLabel="See all products"
        ctaTo="/products"
        ctaIcon={<ArrowRight size={18} weight="bold" />}
      />
    </section>
  )
}
