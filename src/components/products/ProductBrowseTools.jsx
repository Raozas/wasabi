import { Card } from '@heroui/react'
import { SlidersHorizontal } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  PRODUCT_CATEGORY_OPTIONS,
  formatProductCategoryLabel,
} from '../../features/products/product-categories'
import styles from './ProductBrowseTools.module.css'

export function ProductBrowseTools() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedCategory = searchParams.get('category') ?? 'all'

  const categoryOptions = useMemo(() => {
    const options = [...PRODUCT_CATEGORY_OPTIONS]

    if (!options.includes(requestedCategory)) {
      options.push(requestedCategory)
    }

    return options
  }, [requestedCategory])

  function updateSearchParams(updater) {
    const nextSearchParams = new URLSearchParams(searchParams)
    updater(nextSearchParams)
    setSearchParams(nextSearchParams)
  }

  function handleCategoryChange(nextCategory) {
    updateSearchParams((nextSearchParams) => {
      if (nextCategory === 'all') {
        nextSearchParams.delete('category')
      } else {
        nextSearchParams.set('category', nextCategory)
      }
      nextSearchParams.delete('page')
    })
  }

  return (
    <Card className={styles.panel}>
      <Card.Content className={styles.inner}>
        <div className={styles.section}>
          <div className={styles.labelRow}>
            <span className={styles.labelIcon}>
              <SlidersHorizontal size={13} weight="fill" />
            </span>
            <span className={styles.label}>Categories</span>
            <span className={styles.labelDivider} />
            <span className={styles.labelCount}>Quick filters</span>
          </div>

          <div className={styles.chips}>
            {categoryOptions.map((category) => {
              const isActive = category === requestedCategory
              return (
                <button
                  key={category}
                  type="button"
                  className={`${styles.chip} ${isActive ? styles.chipActive : ''}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  <span className={styles.chipLabel}>{formatProductCategoryLabel(category)}</span>
                </button>
              )
            })}
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
