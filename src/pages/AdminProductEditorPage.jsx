import {
  ArrowLeft,
  NotePencil,
  Plus,
  UploadSimple,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { createProduct, getProductById, updateProduct } from '../services/firestore/products'
import { uploadProductImage } from '../services/storage/product-images'

const INITIAL_PRODUCT_FORM = {
  barcode: '',
  category: '',
  isAvailable: true,
  name: '',
  photoUrl: '',
  price: '',
  shortDescription: '',
}

function Field({ children, hint, label }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {hint ? <span className="text-sm text-[var(--color-muted)]">{hint}</span> : null}
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
            barcode: product.barcode ?? '',
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
        barcode: productForm.barcode,
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
    <section className="space-y-6">
      <Button className="w-fit" variant="ghost" onClick={() => navigate('/admin')}>
        <ArrowLeft size={18} weight="bold" />
        Back to products
      </Button>

      <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(24,24,27,0.88))]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Badge
              variant={isEditing ? 'outline' : 'default'}
              className={isEditing ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200' : ''}
            >
              {pageMeta.actionIcon}
              {pageMeta.badge}
            </Badge>
            <Badge variant="outline">{isEditing ? 'Editing mode' : 'Creation mode'}</Badge>
          </div>

          <div>
            <CardTitle className="text-3xl">{pageMeta.heading}</CardTitle>
            <CardDescription className="mt-2 max-w-3xl">
              {pageMeta.subtitle}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {loadingProduct ? (
            <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-soft)] text-sm text-[var(--color-muted)]">
              Loading product...
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-6">
                <Field
                  label="Product name"
                  hint="Use the storefront-facing title customers will see first."
                >
                  <Input
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Ora2 me Lemon Oral Spray"
                    required
                  />
                </Field>

                <div className="grid gap-6 md:grid-cols-3">
                  <Field
                    label="Barcode"
                    hint="Recommended for matching Firebase products with supplier inventory."
                  >
                    <Input
                      value={productForm.barcode}
                      onChange={(event) =>
                        setProductForm((current) => ({ ...current, barcode: event.target.value }))
                      }
                      placeholder="4902201183055"
                    />
                  </Field>

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
                  <Textarea
                    rows={6}
                    value={productForm.shortDescription}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        shortDescription: event.target.value,
                      }))
                    }
                    placeholder="Describe what makes this product useful and trustworthy."
                    required
                  />
                </Field>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
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

                  <Field label="Upload image" hint="Upload a new image instead of using a remote URL.">
                    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel-bg)] px-4 py-4">
                      <UploadSimple size={18} weight="bold" className="text-[var(--color-accent)]" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
                        className="w-full text-sm"
                      />
                    </div>
                  </Field>
                </div>

                <label className="flex items-center justify-between gap-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
                  <div>
                    <p className="font-semibold">Available for storefront</p>
                    <p className="text-sm text-[var(--color-muted)]">
                      Turn this on when the product should be visible to public users.
                    </p>
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
                    className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
                  />
                </label>
              </div>

              {productError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">
                  {productError}
                </div>
              ) : null}

              <div className="flex flex-wrap justify-end gap-3">
                <Button variant="ghost" disabled={savingProduct} onClick={() => navigate('/admin')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={savingProduct}>
                  {pageMeta.actionIcon}
                  {savingProduct ? 'Saving...' : pageMeta.actionLabel}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
