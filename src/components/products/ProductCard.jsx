import { CheckCircle, ShoppingCart, Tag, XCircle } from '@phosphor-icons/react'
import { formatPrice } from '../../features/products/product.utils'
import { useCart } from '../../hooks/useCart'
import styles from './ProductCard.module.css'

export function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <article className={styles.card}>
      <div className={styles.mediaWrap}>
        <img className={styles.image} src={product.photoUrl} alt={product.name} />
        <span className={styles.category}>
          <Tag size={14} weight="fill" />
          {product.category}
        </span>
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <h3 className={styles.title}>{product.name}</h3>
          <span className={styles.price}>{formatPrice(product.price)}</span>
        </div>

        <p className={styles.description}>{product.shortDescription}</p>

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
