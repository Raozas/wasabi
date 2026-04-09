import {
  CheckCircle,
  NotePencil,
  Package,
  Plus,
  SpinnerGap,
  Trash,
  UploadSimple,
  XCircle,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ProductImage } from '../components/products/ProductImage'
import { formatPrice } from '../features/products/product.utils'
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '../services/firestore/products'
import { uploadProductImage } from '../services/storage/product-images'
import styles from './AdminDashboardPage.module.css'

const INITIAL_PRODUCT_FORM = {
  category: '',
  isAvailable: true,
  name: '',
  photoUrl: '',
  price: '',
  shortDescription: '',
}

export function AdminDashboardPage() {
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [savingProducts, setSavingProducts] = useState(false)
  const [productError, setProductError] = useState('')
  const [productSuccess, setProductSuccess] = useState('')
  const [editingProductId, setEditingProductId] = useState(null)
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM)
  const [imageFile, setImageFile] = useState(null)

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

  function resetProductForm() {
    setEditingProductId(null)
    setProductForm(INITIAL_PRODUCT_FORM)
    setImageFile(null)
  }

  function handleProductChange(event) {
    const { checked, name, type, value } = event.target
    setProductForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function startEditingProduct(product) {
    setEditingProductId(product.id)
    setProductForm({
      category: product.category ?? '',
      isAvailable: Boolean(product.isAvailable),
      name: product.name ?? '',
      photoUrl: product.photoUrl ?? '',
      price: String(product.price ?? ''),
      shortDescription: product.shortDescription ?? '',
    })
    setImageFile(null)
    setProductSuccess('')
    setProductError('')
  }

  async function handleProductSubmit(event) {
    event.preventDefault()
    setSavingProducts(true)
    setProductError('')
    setProductSuccess('')

    try {
      const payload = {
        category: productForm.category,
        isAvailable: productForm.isAvailable,
        name: productForm.name,
        photoUrl: productForm.photoUrl,
        price: Number(productForm.price),
        shortDescription: productForm.shortDescription,
      }

      let productRecord = editingProductId
        ? await updateProduct(editingProductId, payload)
        : await createProduct(payload)

      if (imageFile && productRecord?.id) {
        const uploadResult = await uploadProductImage({
          file: imageFile,
          productId: productRecord.id,
        })

        productRecord = await updateProduct(productRecord.id, {
          photoUrl: uploadResult.photoUrl,
        })
      }

      await loadProducts()
      resetProductForm()
      setProductSuccess(editingProductId ? 'Product updated.' : 'Product created.')
    } catch (error) {
      setProductError(error instanceof Error ? error.message : 'Failed to save product.')
    } finally {
      setSavingProducts(false)
    }
  }

  async function handleProductDelete(productId) {
    setSavingProducts(true)
    setProductError('')
    setProductSuccess('')

    try {
      await deleteProduct(productId)
      if (editingProductId === productId) {
        resetProductForm()
      }
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
        <span className={styles.eyebrow}>Admin area</span>
        <h2 className={styles.title}>Product management</h2>
        <p className={styles.copy}>Manage storefront products and inventory from one place.</p>
      </div>

      <section className={styles.sectionBlock}>
        <div className={styles.blockHeader}>
          <span className={styles.blockKicker}>
            <Package size={16} weight="fill" />
            Products
          </span>
          <h3>Manage storefront inventory</h3>
        </div>

        <div className={styles.layout}>
          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionKicker}>
                  {editingProductId ? (
                    <NotePencil size={16} weight="fill" />
                  ) : (
                    <Plus size={16} weight="bold" />
                  )}
                  {editingProductId ? 'Edit product' : 'Add product'}
                </span>
                <h3>{editingProductId ? 'Update product details' : 'Create a new product'}</h3>
              </div>
              {editingProductId ? (
                <button type="button" className={styles.ghostButton} onClick={resetProductForm}>
                  Cancel
                </button>
              ) : null}
            </div>

            <form className={styles.form} onSubmit={handleProductSubmit}>
              <label className={styles.field}>
                <span>Name</span>
                <input name="name" value={productForm.name} onChange={handleProductChange} required />
              </label>

              <div className={styles.row}>
                <label className={styles.field}>
                  <span>Price (UZS)</span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    value={productForm.price}
                    onChange={handleProductChange}
                    required
                  />
                </label>

                <label className={styles.field}>
                  <span>Category</span>
                  <input
                    name="category"
                    value={productForm.category}
                    onChange={handleProductChange}
                    required
                  />
                </label>
              </div>

              <label className={styles.field}>
                <span>Short description</span>
                <textarea
                  name="shortDescription"
                  rows="4"
                  value={productForm.shortDescription}
                  onChange={handleProductChange}
                  required
                />
              </label>

              <label className={styles.field}>
                <span>Photo URL</span>
                <input
                  name="photoUrl"
                  type="url"
                  value={productForm.photoUrl}
                  onChange={handleProductChange}
                  placeholder="https://..."
                />
              </label>

              <label className={styles.field}>
                <span>Upload image</span>
                <div className={styles.uploadField}>
                  <UploadSimple size={18} weight="bold" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                  />
                </div>
              </label>

              <label className={styles.toggle}>
                <input
                  name="isAvailable"
                  type="checkbox"
                  checked={productForm.isAvailable}
                  onChange={handleProductChange}
                />
                <span>Available for storefront</span>
              </label>

              {productError ? <p className={styles.error}>{productError}</p> : null}
              {productSuccess ? <p className={styles.success}>{productSuccess}</p> : null}

              <div className={styles.formActions}>
                <button type="submit" className={styles.button} disabled={savingProducts}>
                  {savingProducts ? (
                    <>
                      <SpinnerGap size={18} className={styles.spin} />
                      Saving...
                    </>
                  ) : editingProductId ? (
                    <>
                      <NotePencil size={18} weight="bold" />
                      Update product
                    </>
                  ) : (
                    <>
                      <Plus size={18} weight="bold" />
                      Create product
                    </>
                  )}
                </button>
                {!editingProductId ? (
                  <Link className={styles.secondaryAction} to="/admin/products/import">
                    <UploadSimple size={18} weight="bold" />
                    Create from CSV file
                  </Link>
                ) : null}
              </div>
            </form>
          </section>

          <section className={styles.card}>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionKicker}>
                  <Package size={16} weight="fill" />
                  Inventory
                </span>
                <h3>All products</h3>
              </div>
              <span className={styles.count}>{products.length}</span>
            </div>

            {loadingProducts ? <div className={styles.state}>Loading products...</div> : null}
            {!loadingProducts && products.length === 0 ? (
              <div className={styles.state}>No products yet.</div>
            ) : null}

            {!loadingProducts && products.length > 0 ? (
              <div className={styles.itemList}>
                {products.map((product) => (
                  <article key={product.id} className={styles.itemCard}>
                    <div className={styles.mediaSummary}>
                      <ProductImage
                        className={styles.previewImage}
                        fallbackClassName={styles.previewFallback}
                        src={product.photoUrl}
                        alt={product.name}
                        iconSize={22}
                      />

                      <div className={styles.itemInfo}>
                        <div className={styles.itemTop}>
                          <strong>{product.name}</strong>
                          <span>{formatPrice(product.price)}</span>
                        </div>
                        <p>{product.shortDescription}</p>
                        <div className={styles.metaRow}>
                          <span className={styles.category}>{product.category}</span>
                          <span
                            className={product.isAvailable ? styles.statusAvailable : styles.statusHidden}
                          >
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
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <button
                        type="button"
                        className={styles.inlineButton}
                        onClick={() => startEditingProduct(product)}
                      >
                        <NotePencil size={16} weight="bold" />
                        Edit
                      </button>
                      <button
                        type="button"
                        className={styles.inlineDanger}
                        onClick={() => handleProductDelete(product.id)}
                        disabled={savingProducts}
                      >
                        <Trash size={16} weight="bold" />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      </section>
    </section>
  )
}
