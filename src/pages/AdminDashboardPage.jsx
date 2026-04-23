import { Button, Card, Chip } from '@heroui/react'
import {
  CheckCircle,
  NotePencil,
  Package,
  Plus,
  Trash,
  UploadSimple,
  XCircle,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProductImage } from '../components/products/ProductImage'
import { formatPrice } from '../features/products/product.utils'
import { deleteProduct, listProducts } from '../services/firestore/products'
import styles from './AdminDashboardPage.module.css'

function truncateText(value, maxLength) {
  const normalized = String(value ?? '').trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [savingProducts, setSavingProducts] = useState(false)
  const [productError, setProductError] = useState('')
  const [productSuccess, setProductSuccess] = useState('')

  useEffect(() => {
    void loadProducts()
  }, [])

  async function loadProducts() {
    setLoadingProducts(true)
    setProductError('')

    try {
      const nextProducts = await listProducts()
      setProducts(nextProducts)
    } catch (error) {
      setProductError(error instanceof Error ? error.message : 'Failed to load products.')
    } finally {
      setLoadingProducts(false)
    }
  }

  async function handleProductDelete(productId) {
    setSavingProducts(true)
    setProductError('')
    setProductSuccess('')

    try {
      await deleteProduct(productId)
      await loadProducts()
      setProductSuccess('Product deleted.')
    } catch (error) {
      setProductError(error instanceof Error ? error.message : 'Failed to delete product.')
    } finally {
      setSavingProducts(false)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <Chip color="primary" variant="flat">
          <Package size={16} weight="fill" />
          Admin area
        </Chip>
        <h2 className={styles.title}>Product management</h2>
        <p className={styles.copy}>Manage storefront products and inventory from one place.</p>
      </div>

      <Card className={styles.card}>
        <Card.Content className={styles.cardContent}>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>
                <Package size={16} weight="fill" />
                Inventory
              </span>
              <h3>All products</h3>
            </div>

            <div className={styles.headerActions}>
              <Button variant="bordered" onClick={() => navigate('/admin/products/import')}>
                <UploadSimple size={18} weight="bold" />
                Import CSV
              </Button>
              <Button color="primary" onClick={() => navigate('/admin/products/new')}>
                <Plus size={18} weight="bold" />
                Добавить товар
              </Button>
            </div>
          </div>

          {productError ? <p className={styles.error}>{productError}</p> : null}
          {productSuccess ? <p className={styles.success}>{productSuccess}</p> : null}

          {loadingProducts ? <div className={styles.state}>Loading products...</div> : null}
          {!loadingProducts && products.length === 0 ? (
            <div className={styles.state}>No products yet.</div>
          ) : null}

          {!loadingProducts && products.length > 0 ? (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className={styles.productCell}>
                          <ProductImage
                            className={styles.previewImage}
                            fallbackClassName={styles.previewFallback}
                            src={product.photoUrl}
                            alt={product.name}
                            iconSize={18}
                          />
                          <div className={styles.productCellText}>
                            <strong>{product.name}</strong>
                            <span>{product.id}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Chip variant="flat">{product.category}</Chip>
                      </td>
                      <td className={styles.priceCell}>{formatPrice(product.price)}</td>
                      <td>
                        <Chip color={product.isAvailable ? 'success' : 'danger'} variant="flat">
                          {product.isAvailable ? (
                            <>
                              <CheckCircle size={14} weight="fill" />
                              Live
                            </>
                          ) : (
                            <>
                              <XCircle size={14} weight="fill" />
                              Hidden
                            </>
                          )}
                        </Chip>
                      </td>
                      <td className={styles.descriptionCell}>
                        {truncateText(product.shortDescription, 40)}
                      </td>
                      <td>
                        <div className={styles.rowActions}>
                          <Button
                            variant="bordered"
                            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                          >
                            <NotePencil size={16} weight="bold" />
                            Edit
                          </Button>
                          <Button
                            color="danger"
                            variant="light"
                            onClick={() => handleProductDelete(product.id)}
                            isDisabled={savingProducts}
                          >
                            <Trash size={16} weight="bold" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </Card.Content>
      </Card>
    </section>
  )
}
