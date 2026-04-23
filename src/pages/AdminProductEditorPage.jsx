import { Button, Card, Chip, Input, Spinner, TextArea } from '@heroui/react'
import { ArrowLeft, NotePencil, Package, Plus, UploadSimple } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createProduct, getProductById, updateProduct } from '../services/firestore/products'
import { uploadProductImage } from '../services/storage/product-images'
import styles from './AdminProductEditorPage.module.css'

const INITIAL_PRODUCT_FORM = {
  category: '',
  isAvailable: true,
  name: '',
  photoUrl: '',
  price: '',
  shortDescription: '',
}

function Field({ children, label, hint }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {hint ? <span className={styles.fieldHint}>{hint}</span> : null}
      {children}
    </label>
  )
}

export function AdminProductEditorPage() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const isEditing = Boolean(productId)
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [loadingProduct, setLoadingProduct] = useState(isEditing)
  const [savingProduct, setSavingProduct] = useState(false)
  const [productError, setProductError] = useState('')

  useEffect(() => {
    if (!productId) {
      return
    }

    let cancelled = false

    async function loadProduct() {
      setLoadingProduct(true)
      setProductError('')

      try {
        const product = await getProductById(productId)

        if (!product) {
          throw new Error('Product not found.')
        }

        if (!cancelled) {
          setProductForm({
            category: product.category ?? '',
            isAvailable: Boolean(product.isAvailable),
            name: product.name ?? '',
            photoUrl: product.photoUrl ?? '',
            price: String(product.price ?? ''),
            shortDescription: product.shortDescription ?? '',
          })
        }
      } catch (error) {
        if (!cancelled) {
          setProductError(error instanceof Error ? error.message : 'Failed to load product.')
        }
      } finally {
        if (!cancelled) {
          setLoadingProduct(false)
        }
      }
    }

    void loadProduct()

    return () => {
      cancelled = true
    }
  }, [productId])

  const pageMeta = useMemo(
    () =>
      isEditing
        ? {
            badge: 'Edit product',
            heading: 'Update product details',
            subtitle: 'Refine content, price, media, and storefront availability for this item.',
            actionLabel: 'Update product',
            actionIcon: <NotePencil size={18} weight="bold" />,
          }
        : {
            badge: 'New product',
            heading: 'Create a new product',
            subtitle: 'Fill in the storefront details carefully so the product looks polished from the first publish.',
            actionLabel: 'Create product',
            actionIcon: <Plus size={18} weight="bold" />,
          },
    [isEditing],
  )

  async function handleSubmit(event) {
    event.preventDefault()
    setSavingProduct(true)
    setProductError('')

    try {
      const payload = {
        category: productForm.category,
        isAvailable: productForm.isAvailable,
        name: productForm.name,
        photoUrl: productForm.photoUrl,
        price: Number(productForm.price),
        shortDescription: productForm.shortDescription,
      }

      let productRecord = isEditing
        ? await updateProduct(productId, payload)
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

      navigate('/admin')
    } catch (error) {
      setProductError(error instanceof Error ? error.message : 'Failed to save product.')
    } finally {
      setSavingProduct(false)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.topBar}>
        <Button variant="light" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} weight="bold" />
          Back to products
        </Button>
      </div>

      <Card className={styles.editorCard}>
        <Card.Content className={styles.editorContent}>
          <div className={styles.hero}>
            <div className={styles.badges}>
              <Chip color={isEditing ? 'warning' : 'primary'} variant="flat">
                {isEditing ? <NotePencil size={16} weight="fill" /> : <Plus size={16} weight="bold" />}
                {pageMeta.badge}
              </Chip>
              <Chip variant="bordered">
                {isEditing ? 'Editing mode' : 'Creation mode'}
              </Chip>
            </div>
            <h2 className={styles.title}>{pageMeta.heading}</h2>
            <p className={styles.copy}>{pageMeta.subtitle}</p>
          </div>

          {loadingProduct ? (
            <div className={styles.state}>Loading product...</div>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <Field label="Product name" hint="Use the storefront-facing title customers will see first.">
                  <Input
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Ora2 me Lemon Oral Spray"
                    required
                  />
                </Field>

                <div className={styles.inlineGrid}>
                  <Field label="Price" hint="Storefront price in UZS.">
                    <Input
                      type="number"
                      min="0"
                      step="1"
                      value={productForm.price}
                      onChange={(event) =>
                        setProductForm((current) => ({ ...current, price: event.target.value }))
                      }
                      placeholder="70000"
                      required
                    />
                  </Field>

                  <Field label="Category" hint="Short category label for storefront grouping.">
                    <Input
                      value={productForm.category}
                      onChange={(event) =>
                        setProductForm((current) => ({ ...current, category: event.target.value }))
                      }
                      placeholder="Cosmetics"
                      required
                    />
                  </Field>
                </div>

                <Field
                  label="Description"
                  hint="Keep it informative and polished. The public card UI will trim long text automatically."
                >
                  <TextArea
                    value={productForm.shortDescription}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        shortDescription: event.target.value,
                      }))
                    }
                    placeholder="Describe what makes this product useful and trustworthy."
                    minRows={5}
                    required
                  />
                </Field>

                <Field label="Photo URL" hint="Optional direct image URL if you already have hosted media.">
                  <Input
                    type="url"
                    value={productForm.photoUrl}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, photoUrl: event.target.value }))
                    }
                    placeholder="https://..."
                  />
                </Field>

                <Field label="Upload image" hint="You can upload a new image instead of using a remote URL.">
                  <div className={styles.uploadField}>
                    <UploadSimple size={18} weight="bold" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                    />
                  </div>
                </Field>

                <label className={styles.toggleCard}>
                  <div>
                    <strong>Available for storefront</strong>
                    <p>Turn this on when the product should be visible to public users.</p>
                  </div>
                  <input
                    name="isAvailable"
                    type="checkbox"
                    checked={productForm.isAvailable}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        isAvailable: event.target.checked,
                      }))
                    }
                  />
                </label>
              </div>

              {productError ? <p className={styles.error}>{productError}</p> : null}

              <div className={styles.formActions}>
                <Button variant="light" onClick={() => navigate('/admin')} isDisabled={savingProduct}>
                  Cancel
                </Button>
                <Button type="submit" color="primary" isDisabled={savingProduct}>
                  {savingProduct ? <Spinner size="sm" /> : pageMeta.actionIcon}
                  {pageMeta.actionLabel}
                </Button>
              </div>
            </form>
          )}
        </Card.Content>
      </Card>
    </section>
  )
}
