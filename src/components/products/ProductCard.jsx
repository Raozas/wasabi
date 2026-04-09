import { CheckCircle, ShoppingCart, Tag, XCircle } from '@phosphor-icons/react'
import { formatPrice } from '../../features/products/product.utils'
import { useCart } from '../../hooks/useCart'
import { ProductImage } from './ProductImage'
import styles from './ProductCard.module.css'

function joinClassNames(...values) {
  return values.filter(Boolean).join(' ')
}

export function ProductCard({ product, size = 'default' }) {
  const { addToCart } = useCart()

  return (
    <article className={joinClassNames(styles.card, styles[`card${size[0].toUpperCase()}${size.slice(1)}`])}>
      <div className={joinClassNames(styles.mediaWrap, styles[`mediaWrap${size[0].toUpperCase()}${size.slice(1)}`])}>
        <ProductImage
          className={styles.image}
          fallbackClassName={styles.imageFallback}
          iconSize={40}
          src={product.photoUrl}
          alt={product.name}
        />
        <span className={styles.category}>
          <Tag size={14} weight="fill" />
          {product.category}
        </span>
      </div>

      <div className={joinClassNames(styles.content, styles[`content${size[0].toUpperCase()}${size.slice(1)}`])}>
        <div className={styles.topRow}>
          <h3 className={joinClassNames(styles.title, styles[`title${size[0].toUpperCase()}${size.slice(1)}`])}>
            {product.name}
          </h3>
          <span className={styles.price}>{formatPrice(product.price)}</span>
        </div>

        <p className={joinClassNames(styles.description, styles[`description${size[0].toUpperCase()}${size.slice(1)}`])}>
          {product.shortDescription}
        </p>

        <div className={styles.meta}>
          <span
            className={product.isAvailable ? styles.statusAvailable : styles.statusUnavailable}
          >
            {product.isAvailable ? (
              <CheckCircle size={16} weight="fill" />
            ) : (
              <XCircle size={16} weight="fill" />
            )}
            {product.isAvailable ? 'In stock' : 'Unavailable'}
          </span>
          <button
            type="button"
            className={styles.cartButton}
            onClick={() => addToCart(product)}
            disabled={!product.isAvailable}
          >
            <ShoppingCart size={16} weight="bold" />
            Add to basket
          </button>
        </div>
      </div>
    </article>
  )
}
