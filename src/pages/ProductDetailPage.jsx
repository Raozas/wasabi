import { Button, Card, Chip, Separator, Skeleton, Tabs } from '@heroui/react'
import {
  CheckCircle,
  House,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  XCircle,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ProductImage } from '../components/products/ProductImage'
import { formatPrice, isPublicProduct } from '../features/products/product.utils'
import { useCart } from '../hooks/useCart'
import { getProductById } from '../services/firestore/products'
import styles from './ProductDetailPage.module.css'

function buildGallery(product) {
  const mainImage = product.photoUrl?.trim() ? product.photoUrl.trim() : ''

  if (!mainImage) {
    return ['']
  }

  return [mainImage, mainImage, mainImage, mainImage]
}

export function ProductDetailPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const { addToCart } = useCart()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadProduct() {
      setLoading(true)
      setError('')

      try {
        const nextProduct = await getProductById(productId)

        if (!cancelled) {
          setProduct(nextProduct)
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : 'Failed to load product.')
          setProduct(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    if (!productId) {
      setLoading(false)
      setProduct(null)
      return () => {
        cancelled = true
      }
    }

    void loadProduct()

    return () => {
      cancelled = true
    }
  }, [productId])

  const gallery = useMemo(() => (product ? buildGallery(product) : []), [product])

  if (!loading && !error && product === null) {
    return <Navigate to="/products" replace />
  }

  if (!loading && product && !isPublicProduct(product)) {
    return <Navigate to="/products" replace />
  }

  function handleAddToCart() {
    if (!product) {
      return
    }

    for (let index = 0; index < quantity; index += 1) {
      addToCart(product)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link to="/" className={styles.breadcrumbLink}>
          <House size={14} weight="duotone" />
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className={styles.breadcrumbLink}>
          Products
        </Link>
        {product ? (
          <>
            <span>/</span>
            <span>{product.category}</span>
            <span>/</span>
            <strong>{product.name}</strong>
          </>
        ) : null}
      </div>

      {loading ? (
        <div className={styles.loadingGrid}>
          <Skeleton className={styles.loadingBlock} />
          <Skeleton className={styles.loadingBlock} />
        </div>
      ) : null}

      {!loading && error ? <Card className={styles.stateCard}>{error}</Card> : null}

      {!loading && product ? (
        <div className={styles.layout}>
          <div className={styles.galleryColumn}>
            <Card className={styles.mediaCard}>
              <Card.Content className={styles.mediaContent}>
                <ProductImage
                  className={styles.mainImage}
                  fallbackClassName={styles.mainImageFallback}
                  src={gallery[selectedImageIndex]}
                  alt={product.name}
                  iconSize={68}
                />
              </Card.Content>
            </Card>

            <div className={styles.thumbnailRow}>
              {gallery.map((image, index) => (
                <button
                  key={`${product.id}-${index}`}
                  type="button"
                  className={
                    index === selectedImageIndex
                      ? `${styles.thumbnailButton} ${styles.thumbnailButtonActive}`
                      : styles.thumbnailButton
                  }
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <ProductImage
                    className={styles.thumbnailImage}
                    fallbackClassName={styles.thumbnailFallback}
                    src={image}
                    alt={`${product.name} preview ${index + 1}`}
                    iconSize={24}
                  />
                </button>
              ))}
            </div>
          </div>

          <Card className={styles.infoCard}>
            <Card.Content className={styles.infoContent}>
              <div className={styles.titleBlock}>
                <Chip color="primary" variant="flat">
                  {product.category}
                </Chip>
                <h1 className={styles.title}>{product.name}</h1>
                <p className={styles.description}>{product.shortDescription}</p>
                <div className={styles.ratingRow}>
                  <span className={styles.stars}>★★★★★</span>
                  <span className={styles.ratingText}>Professional storefront selection</span>
                </div>
              </div>

              <Separator />

              <div className={styles.priceBlock}>
                <strong className={styles.price}>{formatPrice(product.price)}</strong>
                <span className={styles.priceHint}>Current public catalog price</span>
              </div>

              <Separator />

              <div className={styles.optionBlock}>
                <h2 className={styles.optionTitle}>Choose a view</h2>
                <Tabs.Root defaultSelectedKey="soft" variant="underlined">
                  <Tabs.List aria-label="Product styles">
                    <Tabs.Tab id="soft">Soft</Tabs.Tab>
                    <Tabs.Tab id="classic">Classic</Tabs.Tab>
                    <Tabs.Tab id="premium">Premium</Tabs.Tab>
                  </Tabs.List>
                </Tabs.Root>
              </div>

              <div className={styles.controlsRow}>
                <div className={styles.quantityControl}>
                  <Button
                    isIconOnly
                    variant="light"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  >
                    <Minus size={16} weight="bold" />
                  </Button>
                  <span className={styles.quantityValue}>{quantity}</span>
                  <Button
                    isIconOnly
                    variant="light"
                    onClick={() => setQuantity((current) => current + 1)}
                  >
                    <Plus size={16} weight="bold" />
                  </Button>
                </div>

                <div className={styles.stockBlock}>
                  <Chip color={product.isAvailable ? 'success' : 'danger'} variant="flat">
                    {product.isAvailable ? (
                      <>
                        <CheckCircle size={14} weight="fill" />
                        In stock
                      </>
                    ) : (
                      <>
                        <XCircle size={14} weight="fill" />
                        Unavailable
                      </>
                    )}
                  </Chip>
                  <span className={styles.stockHint}>
                    {product.isAvailable ? 'Ready to add to basket' : 'Temporarily not available'}
                  </span>
                </div>
              </div>

              <div className={styles.actions}>
                <Button
                  color="primary"
                  size="lg"
                  onClick={() => navigate('/basket')}
                  isDisabled={!product.isAvailable}
                >
                  Buy Now
                </Button>
                <Button
                  variant="bordered"
                  size="lg"
                  startContent={<ShoppingCart size={18} weight="bold" />}
                  onClick={handleAddToCart}
                  isDisabled={!product.isAvailable}
                >
                  Add to Cart
                </Button>
              </div>

              <div className={styles.serviceCards}>
                <Card className={styles.serviceCard}>
                  <Card.Content className={styles.serviceContent}>
                    <Truck size={18} weight="duotone" />
                    <div>
                      <strong>Free Delivery</strong>
                      <p>Enter your details in the basket and continue to direct order confirmation.</p>
                    </div>
                  </Card.Content>
                </Card>
                <Card className={styles.serviceCard}>
                  <Card.Content className={styles.serviceContent}>
                    <ShoppingCart size={18} weight="duotone" />
                    <div>
                      <strong>Return Delivery</strong>
                      <p>Catalog information stays intact. Only UI presentation changes on this page.</p>
                    </div>
                  </Card.Content>
                </Card>
              </div>
            </Card.Content>
          </Card>
        </div>
      ) : null}
    </section>
  )
}
