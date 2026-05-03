import {
  CheckCircle,
  NotePencil,
  Plus,
  Rows,
  Trash,
  UploadSimple,
  XCircle,
} from '@phosphor-icons/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { PaginationControls } from '../components/ui/PaginationControls'
import { formatPrice } from '../features/products/product.utils'
import {
  deleteProduct,
  getProductCountsSummary,
  listProductsPage,
} from '../services/firestore/products'

function parsePage(value) {
  const parsedPage = Number(value)
  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1
}

function truncateText(value, maxLength) {
  const normalized = String(value ?? '').trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`
}

export function AdminDashboardPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const currentPage = parsePage(searchParams.get('page'))
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [savingProducts, setSavingProducts] = useState(false)
  const [productError, setProductError] = useState('')
  const [productSuccess, setProductSuccess] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    totalCount: 0,
    totalPages: 0,
  })
  const [productCounts, setProductCounts] = useState({
    hiddenCount: 0,
    liveCount: 0,
    totalCount: 0,
  })

  const updateSearchParams = useCallback((updater) => {
    const nextSearchParams = new URLSearchParams(searchParams)
    updater(nextSearchParams)
    setSearchParams(nextSearchParams)
  }, [searchParams, setSearchParams])

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true)
    setProductError('')

    try {
      const result = await listProductsPage({
        page: currentPage,
        pageSize: 25,
      })

      setProducts(result.items)
      setPagination({
        page: result.page,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
      })

      if (result.page !== currentPage) {
        updateSearchParams((nextSearchParams) => {
          if (result.page <= 1) {
            nextSearchParams.delete('page')
          } else {
            nextSearchParams.set('page', String(result.page))
          }
        })
      }
    } catch (error) {
      setProductError(error instanceof Error ? error.message : 'Failed to load products.')
    } finally {
      setLoadingProducts(false)
    }
  }, [currentPage, updateSearchParams])

  const loadStats = useCallback(async () => {
    try {
      const nextStats = await getProductCountsSummary()
      setProductCounts(nextStats)
    } catch (error) {
      setProductError(error instanceof Error ? error.message : 'Failed to load product stats.')
    }
  }, [])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  async function handleProductDelete(productId) {
    setSavingProducts(true)
    setProductError('')
    setProductSuccess('')

    try {
      await deleteProduct(productId)
      await loadStats()

      if (products.length === 1 && currentPage > 1) {
        updateSearchParams((nextSearchParams) => {
          const previousPage = currentPage - 1

          if (previousPage <= 1) {
            nextSearchParams.delete('page')
          } else {
            nextSearchParams.set('page', String(previousPage))
          }
        })
      } else {
        await loadProducts()
      }

      setProductSuccess('Product deleted.')
    } catch (error) {
      setProductError(error instanceof Error ? error.message : 'Failed to delete product.')
    } finally {
      setSavingProducts(false)
    }
  }

  const stats = useMemo(() => {
    return [
      {
        label: 'Total products',
        value: productCounts.totalCount,
      },
      {
        label: 'Live products',
        value: productCounts.liveCount,
      },
      {
        label: 'Hidden products',
        value: productCounts.hiddenCount,
      },
    ]
  }, [productCounts.hiddenCount, productCounts.liveCount, productCounts.totalCount])

  function handlePageChange(nextPage) {
    updateSearchParams((nextSearchParams) => {
      if (nextPage <= 1) {
        nextSearchParams.delete('page')
      } else {
        nextSearchParams.set('page', String(nextPage))
      }
    })
  }

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
              <Plus size={18} weight="bold" />
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
            <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-(--color-border) bg-(--color-card-soft) text-sm text-(--color-muted)">
              Loading products...
            </div>
          ) : null}

          {!loadingProducts && products.length === 0 ? (
            <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-(--color-border) bg-(--color-card-soft) text-sm text-(--color-muted)">
              No products yet.
            </div>
          ) : null}

          {!loadingProducts && products.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-panel-bg)">
              <div className="overflow-x-auto">
                <Table className="min-w-240 table-fixed">
                  <TableHeader className="bg-(--color-surface-strong)">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[18rem]">Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Barcode</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[16rem]">Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="w-[18rem] max-w-[18rem]">
                          <div className="flex items-center gap-3">
                            <ProductImage
                              className="h-12 w-12 rounded-xl object-cover"
                              fallbackClassName="grid h-12 w-12 place-items-center rounded-xl bg-[var(--color-surface-alt)] text-[var(--color-accent)]"
                              src={product.photoUrl}
                              alt={product.name}
                              iconSize={18}
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold" title={product.name}>
                                {product.name}
                              </p>
                              <p className="truncate text-xs text-(--color-muted)">
                                {product.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-(--color-muted)">
                          {product.barcode || 'No barcode'}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-semibold text-(--color-accent)">
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
                        <TableCell className="w-[16rem] max-w-[16rem] text-(--color-muted)">
                          <p className="truncate" title={product.shortDescription}>
                            {product.shortDescription}
                          </p>
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
              <div className="px-4 py-4 sm:px-6">
                <PaginationControls
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  totalCount={pagination.totalCount}
                  onPageChange={handlePageChange}
                  disabled={loadingProducts || savingProducts}
                />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
