import { Button, Card, Spinner } from '@heroui/react'
import { ArrowRight, Package } from '@phosphor-icons/react'
import { useNavigate } from 'react-router-dom'
import { ProductGrid } from './ProductGrid'
import { PaginationControls } from '../ui/PaginationControls'
import styles from './ProductCatalogSection.module.css'

export function ProductCatalogSection({
  title,
  description,
  products,
  gridSize,
  loading,
  error,
  emptyMessage,
  ctaLabel,
  ctaTo,
  ctaIcon,
  pagination,
}) {
  const navigate = useNavigate()

  return (
    <Card className={styles.section}>
      <Card.Content className={styles.inner}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              <Package size={22} weight="duotone" />
              {title}
            </h2>
            <p className={styles.description}>{description}</p>
          </div>
          {ctaLabel && ctaTo ? (
            <Button
              variant="light"
              color="primary"
              onClick={() => navigate(ctaTo)}
              endContent={ctaIcon ?? <ArrowRight size={18} weight="bold" />}
            >
              {ctaLabel}
            </Button>
          ) : null}
        </div>

        {loading ? (
          <div className={styles.state}>
            <Spinner size="sm" />
            Loading products...
          </div>
        ) : null}
        {!loading && error ? <div className={styles.state}>{error}</div> : null}
        {!loading && !error && products.length === 0 ? (
          <div className={styles.state}>{emptyMessage}</div>
        ) : null}
        {!loading && !error && products.length > 0 ? (
          <>
            <ProductGrid products={products} cardSize={gridSize} />
            {pagination ? (
              <PaginationControls
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                onPageChange={pagination.onPageChange}
              />
            ) : null}
          </>
        ) : null}
      </Card.Content>
    </Card>
  )
}
