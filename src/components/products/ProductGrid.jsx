import { ProductCard } from './ProductCard'
import styles from './ProductGrid.module.css'

function joinClassNames(...values) {
  return values.filter(Boolean).join(' ')
}

export function ProductGrid({ products, cardSize = 'default' }) {
  return (
    <div className={joinClassNames(styles.grid, styles[`grid${cardSize[0].toUpperCase()}${cardSize.slice(1)}`])}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} size={cardSize} />
      ))}
    </div>
  )
}
