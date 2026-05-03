import {
  CheckCircle,
  NotePencil,
  Package,
  Plus,
  Rows,
  Trash,
  UploadSimple,
  XCircle,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { cn } from '../lib/utils'
import { ProductImage } from '../components/products/ProductImage'
import { formatPrice } from '../features/products/product.utils'
import { deleteProduct, listProducts } from '../services/firestore/products'
import { color } from 'framer-motion'

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

  const stats = useMemo(() => {
    const liveCount = products.filter((product) => product.isAvailable).length
    const hiddenCount = products.length - liveCount
    const categories = new Set(products.map((product) => product.category).filter(Boolean))

    return [
      {
        label: 'Total products',
        value: products.length,
      },
      {
        label: 'Live products',
        value: liveCount,
      },
      {
        label: 'Hidden products',
        value: hiddenCount,
      },
      {
        label: 'Categories',
        value: categories.size,
      },
    ]
  }, [products])

  return (
    <section className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => (
          <Card key={item.label} className="bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(24,24,27,0.88))]">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase tracking-[0.16em]">
                {item.label}
              </CardDescription>
              <CardTitle className="text-3xl">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(24,24,27,0.88))]">
        <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary">
              <Rows size={14} weight="fill" />
              Inventory overview
            </Badge>
            <div>
              <CardTitle className="text-2xl">Product management</CardTitle>
              <CardDescription>
                Review the full storefront catalog, update product content, and remove items that
                should no longer be sold.
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate('/admin/products/import')}>
              <UploadSimple size={18} weight="bold" />
              Import CSV
            </Button>
            <Button variant="outline" onClick={() => navigate('/admin/products/new')}>
              <Plus size={18} weight="bold"  />
              New product
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {productError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">
              {productError}
            </div>
          ) : null}

          {productSuccess ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200">
              {productSuccess}
            </div>
          ) : null}

          {loadingProducts ? (
            <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-soft)] text-sm text-[var(--color-muted)]">
              Loading products...
            </div>
          ) : null}

          {!loadingProducts && products.length === 0 ? (
            <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-soft)] text-sm text-[var(--color-muted)]">
              No products yet.
            </div>
          ) : null}

          {!loadingProducts && products.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
              <div className="overflow-x-auto">
                <Table className="min-w-[960px]">
                  <TableHeader className="bg-[var(--color-surface-strong)]">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <ProductImage
                              className="h-12 w-12 rounded-xl object-cover"
                              fallbackClassName="grid h-12 w-12 place-items-center rounded-xl bg-[var(--color-surface-alt)] text-[var(--color-accent)]"
                              src={product.photoUrl}
                              alt={product.name}
                              iconSize={18}
                            />
                            <div className="min-w-0">
                              <p className="truncate font-semibold">{product.name}</p>
                              <p className="truncate text-xs text-[var(--color-muted)]">
                                {product.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-semibold text-[var(--color-accent)]">
                          {formatPrice(product.price)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              product.isAvailable
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'
                                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200',
                            )}
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
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs text-[var(--color-muted)]">
                          {truncateText(product.shortDescription, 52)}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            >
                              <NotePencil size={16} weight="bold" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              disabled={savingProducts}
                              onClick={() => handleProductDelete(product.id)}
                            >
                              <Trash size={16} weight="bold" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
