import { Button, ButtonGroup, Card, Chip } from '@heroui/react'
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

    return categoryMeta.some((item) => item.category === requestedCategory)
      ? requestedCategory
      : 'all'
  }, [categoryMeta, requestedCategory])

  const activeCardSize = normalizeCatalogCardSize(
    searchParams.get('size') ?? readStoredCatalogCardSize(),
  )

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
    <Card className={styles.panel}>
      <Card.Content className={styles.inner}>
        <div className={styles.header}>
          <div>
            <span className={styles.kicker}>
              <SlidersHorizontal size={14} weight="fill" />
              Browse tools
            </span>
            <strong className={styles.title}>Catalog controls</strong>
          </div>
          {activeCategory !== 'all' ? (
            <Button
              type="button"
              variant="light"
              color="danger"
              className={styles.clearButton}
              onClick={() => handleCategoryChange('all')}
            >
              <X size={14} weight="bold" />
              Clear
            </Button>
          ) : null}
        </div>

        <div className={styles.summary}>
          <Chip className={styles.summaryPill} color="primary" variant="flat">
            <MagnifyingGlass size={14} weight="bold" />
            {loading ? 'Loading...' : `${products.length} total`}
          </Chip>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>Categories</span>
          <div className={styles.chips}>
            <ButtonGroup className={styles.group} variant="bordered">
              <Button
                type="button"
                color={activeCategory === 'all' ? 'primary' : 'default'}
                variant={activeCategory === 'all' ? 'solid' : 'light'}
                onClick={() => handleCategoryChange('all')}
              >
                All ({products.length})
              </Button>
              {categoryMeta.map((item) => (
                <Button
                  key={item.category}
                  type="button"
                  color={activeCategory === item.category ? 'primary' : 'default'}
                  variant={activeCategory === item.category ? 'solid' : 'light'}
                  onClick={() => handleCategoryChange(item.category)}
                >
                  {item.category} ({item.count})
                </Button>
              ))}
            </ButtonGroup>
          </div>
        </div>

        <div className={styles.section}>
          <span className={styles.label}>
            <Rows size={14} weight="fill" />
            Card size
          </span>
          <ButtonGroup className={styles.sizeList} variant="bordered">
            {CATALOG_CARD_SIZE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                color={activeCardSize === option.value ? 'primary' : 'default'}
                variant={activeCardSize === option.value ? 'solid' : 'light'}
                className={styles.sizeButton}
                onClick={() => handleCardSizeChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </Card.Content>
    </Card>
  )
}
