import {
  ChatCircleDots,
  DownloadSimple,
  ArrowSquareOut,
} from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
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
import { formatPrice } from '../features/products/product.utils'
import {
  exportPurchaseRequestsCsv,
  exportPurchaseRequestsXlsx,
} from '../features/purchase-requests/purchase-request-export'
import { getConversationResultMeta } from '../features/purchase-requests/conversation-results'
import { listPurchaseRequests } from '../services/firestore/purchase-requests'

export function AdminContactsPage() {
  const navigate = useNavigate()
  const [purchaseRequests, setPurchaseRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [requestError, setRequestError] = useState('')

  useEffect(() => {
    void loadPurchaseRequests()
  }, [])

  async function loadPurchaseRequests() {
    setLoadingRequests(true)
    setRequestError('')

    try {
      const nextRequests = await listPurchaseRequests()
      setPurchaseRequests(nextRequests)
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to load requests.')
    } finally {
      setLoadingRequests(false)
    }
  }

  function getNotesPreview(request) {
    const nextNotes = String(request.notes ?? '').trim()

    if (!nextNotes) {
      return 'No notes'
    }

    return nextNotes.length > 18 ? `${nextNotes.slice(0, 18)}...` : nextNotes
  }

  function getStatusBadgeClass(status) {
    return status === 'contacted'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'
      : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
  }

  return (
    <section className="space-y-6">
      <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(24,24,27,0.88))]">
        <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary">
              <ChatCircleDots size={14} weight="fill" />
              Customer leads
            </Badge>
            <div>
              <CardTitle className="text-2xl">Purchase requests</CardTitle>
              <CardDescription>
                Review incoming requests, update internal notes, and mark customers as contacted.
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              disabled={purchaseRequests.length === 0}
              onClick={() => exportPurchaseRequestsCsv(purchaseRequests)}
            >
              <DownloadSimple size={16} weight="bold" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              disabled={purchaseRequests.length === 0}
              onClick={() => exportPurchaseRequestsXlsx(purchaseRequests)}
            >
              <DownloadSimple size={16} weight="bold" />
              Export XLSX
            </Button>
            <Badge variant="outline">{purchaseRequests.length} requests</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {requestError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">
              {requestError}
            </div>
          ) : null}

          {loadingRequests ? (
            <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-soft)] text-sm text-[var(--color-muted)]">
              Loading requests...
            </div>
          ) : null}

          {!loadingRequests && purchaseRequests.length === 0 ? (
            <div className="grid min-h-48 place-items-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-soft)] text-sm text-[var(--color-muted)]">
              No purchase requests yet.
            </div>
          ) : null}

          {!loadingRequests && purchaseRequests.length > 0 ? (
            <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
              <div className="overflow-x-auto">
                <Table className="min-w-[920px]">
                  <TableHeader className="bg-[var(--color-surface-strong)]">
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Customer</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Open</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseRequests.map((request) => {
                      const resultMeta = getConversationResultMeta(request.conversationResult)
                      const ResultIcon = resultMeta?.icon

                      return (
                        <TableRow
                          key={request.id}
                          className="cursor-pointer"
                          onClick={() => navigate(`/admin/contacts/${request.id}`)}
                        >
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-semibold">{request.customerName || 'Unnamed customer'}</p>
                              <p className="text-xs text-[var(--color-muted)]">
                                {request.instagramUsername || 'No Instagram username'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-[var(--color-muted)]">
                            {request.contactInfo}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-[var(--color-muted)]">
                            {request.totalItems}
                          </TableCell>
                          <TableCell className="whitespace-nowrap font-medium">
                            {formatPrice(request.totalPrice)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className={getStatusBadgeClass(request.status)}>
                                {request.status}
                              </Badge>
                              {resultMeta ? (
                                <Badge variant="outline" className={resultMeta.className}>
                                  {ResultIcon ? <ResultIcon size={14} weight="fill" /> : null}
                                  {resultMeta.label}
                                </Badge>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-40 truncate text-[var(--color-muted)]">
                            {getNotesPreview(request)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(event) => {
                                event.stopPropagation()
                                navigate(`/admin/contacts/${request.id}`)
                              }}
                            >
                              <ArrowSquareOut size={16} weight="bold" />
                              Open
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
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
