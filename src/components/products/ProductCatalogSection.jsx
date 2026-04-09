import { ArrowRight, Package } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { ProductGrid } from './ProductGrid'
import styles from './ProductCatalogSection.module.css'

export function ProductCatalogSection({
  title,
  description,
  products,
  loading,
  error,
  emptyMessage,
  ctaLabel,
  ctaTo,
  ctaIcon,
}) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>
            <Package size={22} weight="duotone" />
            {title}
          </h2>
          <p className={styles.description}>{description}</p>
        </div>
        {ctaLabel && ctaTo ? (
          <Link className={styles.link} to={ctaTo}>
            {ctaIcon ?? <ArrowRight size={18} weight="bold" />}
            {ctaLabel}
          </Link>
        ) : null}
      </div>

      {loading ? <div className={styles.state}>Loading products...</div> : null}
      {!loading && error ? <div className={styles.state}>{error}</div> : null}
      {!loading && !error && products.length === 0 ? (
        <div className={styles.state}>{emptyMessage}</div>
      ) : null}
      {!loading && !error && products.length > 0 ? <ProductGrid products={products} /> : null}
    </section>
  )
}
