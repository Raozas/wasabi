import { Button, Card, Chip } from '@heroui/react'
import { CheckCircle, Minus, Plus, ShoppingCart, Tag, XCircle } from '@phosphor-icons/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '../../features/products/product.utils'
import { useCart } from '../../hooks/useCart'
import { ProductImage } from './ProductImage'
import styles from './ProductCard.module.css'

function joinClassNames(...values) {
  return values.filter(Boolean).join(' ')
}

function truncateDescription(description, maxLength = 50) {
  const normalized = String(description ?? '').trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`
}

export function ProductCard({ product, size = 'small' }) {
  const { addToCart, cartItems, decreaseQuantity, increaseQuantity } = useCart()
  const navigate = useNavigate()
  const normalizedSize = size === 'small' ? 'Small' : size === 'large' ? 'Large' : ''
  const shortDescription = truncateDescription(product.shortDescription, 50)
  const cartQuantity = useMemo(
    () => cartItems.find((item) => item.id === product.id)?.quantity ?? 0,
    [cartItems, product.id],
  )

  function openProductPage() {
    navigate(`/products/${product.id}`)
  }

  function handleAddToCart(event) {
    event.stopPropagation()
    addToCart(product)
  }

  return (
    <Card
      className={joinClassNames(styles.card, styles[`card${normalizedSize}`])}
      role="link"
      tabIndex={0}
      onClick={openProductPage}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openProductPage()
        }
      }}
    >
      <Card.Content className={styles.cardInner}>
        <div className={joinClassNames(styles.mediaWrap, styles[`mediaWrap${normalizedSize}`])}>
          <ProductImage
            className={styles.image}
            fallbackClassName={styles.imageFallback}
            iconSize={40}
            src={product.photoUrl}
            alt={product.name}
          />
          <Chip className={styles.category} color="primary" variant="flat">
            <Tag size={14} weight="fill" />
            {product.category}
          </Chip>
          <Chip
            color={product.isAvailable ? 'success' : 'danger'}
            variant="flat"
            className={joinClassNames(
              styles.statusChip,
              product.isAvailable ? styles.statusAvailable : styles.statusUnavailable,
            )}
          >
            {product.isAvailable ? (
              <CheckCircle size={16} weight="fill" />
            ) : (
              <XCircle size={16} weight="fill" />
            )}
            <span className={styles.statusLabel}>
              {product.isAvailable ? 'In stock' : 'Unavailable'}
            </span>
          </Chip>
        </div>

        <div className={joinClassNames(styles.content, styles[`content${normalizedSize}`])}>
          <div className={styles.topRow}>
            <h3 className={joinClassNames(styles.title, styles[`title${normalizedSize}`])}>
              <span className={styles.titleLink}>{product.name}</span>
            </h3>
            <span className={styles.price}>{formatPrice(product.price)}</span>
          </div>

          <p className={joinClassNames(styles.description, styles[`description${normalizedSize}`])}>
            {shortDescription}
          </p>

          <div className={styles.meta}>
            {cartQuantity > 0 ? (
              <div
                className={styles.quantityControl}
                onClick={(event) => event.stopPropagation()}
                onKeyDown={(event) => event.stopPropagation()}
              >
                <Button
                  isIconOnly
                  variant="light"
                  className={styles.quantityButton}
                  onClick={() => decreaseQuantity(product.id)}
                  isDisabled={!product.isAvailable}
                >
                  <Minus size={14} weight="bold" />
                </Button>
                <span className={styles.quantityValue}>{cartQuantity}</span>
                <Button
                  isIconOnly
                  variant="light"
                  className={styles.quantityButton}
                  onClick={() => increaseQuantity(product.id)}
                  isDisabled={!product.isAvailable}
                >
                  <Plus size={14} weight="bold" />
                </Button>
              </div>
            ) : null}
            <Button
              color="primary"
              className={styles.cartButton}
              onClick={handleAddToCart}
              isDisabled={!product.isAvailable}
              startContent={<ShoppingCart size={16} weight="bold" />}
            >
              Add to basket
            </Button>
          </div>
        </div>
      </Card.Content>
    </Card>
  )
}
