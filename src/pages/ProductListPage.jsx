import { ShoppingBag } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart'
import { useProducts } from '../hooks/useProducts'
import { ProductCatalogSection } from '../components/products/ProductCatalogSection'
import styles from './ProductListPage.module.css'

export function ProductListPage() {
  const { totalItems } = useCart()
  const { error, loading, products } = useProducts({ publicOnly: true })

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>Guest storefront</span>
        <h2 className={styles.title}>Browse available products</h2>
        <p className={styles.copy}>
          This catalog only renders products that are complete enough for public display and marked
          as available.
        </p>
        <Link className={styles.basketLink} to="/basket">
          <ShoppingBag size={18} weight="duotone" />
          Basket {totalItems > 0 ? `(${totalItems})` : ''}
        </Link>
      </div>

      <ProductCatalogSection
        title="Catalog"
        description="Responsive product browsing powered by Firestore."
        products={products}
        loading={loading}
        error={error}
        emptyMessage="No public products are available yet."
      />
    </section>
  )
}
