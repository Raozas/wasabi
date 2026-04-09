import { MagnifyingGlass, Rows, SlidersHorizontal, X } from '@phosphor-icons/react'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CATALOG_CARD_SIZE_OPTIONS,
  CATALOG_CARD_SIZE_STORAGE_KEY,
  normalizeCatalogCardSize,
  readStoredCatalogCardSize,
} from '../../features/products/catalog-controls'
import { useProducts } from '../../hooks/useProducts'
import styles from './ProductBrowseTools.module.css'

export function ProductBrowseTools() {
  const { loading, products } = useProducts({ publicOnly: true })
  const [searchParams, setSearchParams] = useSearchParams()

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

  const requestedCategory = searchParams.get('category') ?? 'all'
  const activeCategory = useMemo(() => {
    if (requestedCategory === 'all') {
      return 'all'
    }

    return categoryMeta.some((item) => item.category === requestedCategory) ? requestedCategory : 'all'
  }, [categoryMeta, requestedCategory])

  const activeCardSize = normalizeCatalogCardSize(searchParams.get('size') ?? readStoredCatalogCardSize())

  useEffect(() => {
    window.localStorage.setItem(CATALOG_CARD_SIZE_STORAGE_KEY, activeCardSize)
  }, [activeCardSize])

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
    })
  }

  function handleCardSizeChange(nextSize) {
    const normalizedSize = normalizeCatalogCardSize(nextSize)

    updateSearchParams((nextSearchParams) => {
      if (normalizedSize === 'default') {
        nextSearchParams.delete('size')
      } else {
        nextSearchParams.set('size', normalizedSize)
      }
    })
  }

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span className={styles.kicker}>
            <SlidersHorizontal size={14} weight="fill" />
            Browse tools
          </span>
          <strong className={styles.title}>Catalog controls</strong>
        </div>
        {activeCategory !== 'all' ? (
          <button type="button" className={styles.clearButton} onClick={() => handleCategoryChange('all')}>
            <X size={14} weight="bold" />
            Clear
          </button>
        ) : null}
      </div>

      <div className={styles.summary}>
        <span className={styles.summaryPill}>
          <MagnifyingGlass size={14} weight="bold" />
          {loading ? 'Loading...' : `${products.length} total`}
        </span>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>Categories</span>
        <div className={styles.chips}>
          <button
            type="button"
            className={activeCategory === 'all' ? `${styles.chip} ${styles.chipActive}` : styles.chip}
            onClick={() => handleCategoryChange('all')}
          >
            All
            <span>{products.length}</span>
          </button>
          {categoryMeta.map((item) => (
            <button
              key={item.category}
              type="button"
              className={activeCategory === item.category ? `${styles.chip} ${styles.chipActive}` : styles.chip}
              onClick={() => handleCategoryChange(item.category)}
            >
              {item.category}
              <span>{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <span className={styles.label}>
          <Rows size={14} weight="fill" />
          Card size
        </span>
        <div className={styles.sizeList}>
          {CATALOG_CARD_SIZE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={
                activeCardSize === option.value ? `${styles.sizeButton} ${styles.sizeButtonActive}` : styles.sizeButton
              }
              onClick={() => handleCardSizeChange(option.value)}
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
