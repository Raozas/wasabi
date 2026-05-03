import {
  ChatCircleDots,
  CheckCircle,
  DownloadSimple,
  X,
} from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { Textarea } from '../components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'
import { cn } from '../lib/utils'
import { formatPrice } from '../features/products/product.utils'
import {
  exportPurchaseRequestsCsv,
  exportPurchaseRequestsXlsx,
} from '../features/purchase-requests/purchase-request-export'
import {
  listPurchaseRequests,
  updatePurchaseRequestNotes,
  updatePurchaseRequestStatus,
} from '../services/firestore/purchase-requests'

export function AdminContactsPage() {
  const [purchaseRequests, setPurchaseRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [savingRequests, setSavingRequests] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState('')
  const [selectedRequestId, setSelectedRequestId] = useState('')
  const [notesDrafts, setNotesDrafts] = useState({})

  useEffect(() => {
    void loadPurchaseRequests()
  }, [])

  async function loadPurchaseRequests() {
    setLoadingRequests(true)
    setRequestError('')

    try {
      const nextRequests = await listPurchaseRequests()
      setPurchaseRequests(nextRequests)
      setSelectedRequestId((current) => {
        if (current && nextRequests.some((request) => request.id === current)) {
          return current
        }

        return nextRequests[0]?.id ?? ''
      })
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to load requests.')
    } finally {
      setLoadingRequests(false)
    }
  }

  async function handleRequestStatus(requestId, status) {
    setSavingRequests(true)
    setRequestError('')
    setRequestSuccess('')

    try {
      await updatePurchaseRequestStatus(requestId, status)
      await loadPurchaseRequests()
      setRequestSuccess(status === 'contacted' ? 'Request marked as contacted.' : 'Request updated.')
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to update request.')
    } finally {
      setSavingRequests(false)
    }
  }

  async function handleRequestNotesSave(requestId) {
    const nextNotes = notesDrafts[requestId] ?? selectedRequest?.notes ?? ''

    setSavingRequests(true)
    setRequestError('')
    setRequestSuccess('')

    try {
      await updatePurchaseRequestNotes(requestId, nextNotes)
      await loadPurchaseRequests()
      setNotesDrafts((current) => ({
        ...current,
        [requestId]: nextNotes,
      }))
      setRequestSuccess('Request notes saved.')
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to save notes.')
    } finally {
      setSavingRequests(false)
    }
  }

  const selectedRequest = useMemo(
    () => purchaseRequests.find((request) => request.id === selectedRequestId) ?? null,
    [purchaseRequests, selectedRequestId],
  )

  const selectedRequestNotes = selectedRequest
    ? (notesDrafts[selectedRequest.id] ?? selectedRequest.notes ?? '')
    : ''

  function getNotesPreview(request) {
    const nextNotes = String(notesDrafts[request.id] ?? request.notes ?? '').trim()

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

          {requestSuccess ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200">
              {requestSuccess}
            </div>
          ) : null}

          {savingRequests ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-4 py-3 text-sm text-[var(--color-muted)]">
              Updating request...
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
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_380px]">
              <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
                <div className="overflow-x-auto">
                  <Table className="min-w-[820px]">
                    <TableHeader className="bg-[var(--color-surface-strong)]">
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchaseRequests.map((request) => {
                        const isSelected = request.id === selectedRequestId

                        return (
                          <TableRow
                            key={request.id}
                            className={cn(
                              'cursor-pointer',
                              isSelected && 'bg-[var(--color-accent-soft)] hover:bg-[var(--color-accent-soft)]',
                            )}
                            onClick={() => setSelectedRequestId(request.id)}
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
                              <Badge variant="outline" className={getStatusBadgeClass(request.status)}>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-40 truncate text-[var(--color-muted)]">
                              {getNotesPreview(request)}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {selectedRequest ? (
                <Card className="h-fit xl:sticky xl:top-32">
                  <CardHeader className="flex-row items-start justify-between gap-4">
                    <div>
                      <Badge variant="outline">Selected request</Badge>
                      <CardTitle className="mt-3 text-xl">
                        {selectedRequest.customerName || 'Unnamed customer'}
                      </CardTitle>
                      <CardDescription>
                        Review customer context and track outreach from one place.
                      </CardDescription>
                    </div>
                    <Button
                      className="shrink-0"
                      size="icon"
                      variant="ghost"
                      onClick={() => setSelectedRequestId('')}
                    >
                      <X size={16} weight="bold" />
                    </Button>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                          Contact
                        </p>
                        <p className="mt-2 text-sm font-medium">{selectedRequest.contactInfo}</p>
                      </div>
                      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                          Instagram
                        </p>
                        <p className="mt-2 text-sm font-medium">
                          {selectedRequest.instagramUsername || 'Not provided'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                          Total items
                        </p>
                        <p className="mt-2 text-sm font-medium">{selectedRequest.totalItems}</p>
                      </div>
                      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                          Total price
                        </p>
                        <p className="mt-2 text-sm font-medium">
                          {formatPrice(selectedRequest.totalPrice)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                          Order summary
                        </p>
                        <Badge variant="outline" className={getStatusBadgeClass(selectedRequest.status)}>
                          {selectedRequest.status}
                        </Badge>
                      </div>
                      <Textarea
                        className="min-h-[140px] resize-none bg-[var(--color-panel-bg)]"
                        readOnly
                        value={selectedRequest.orderSummary}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                        Staff notes
                      </p>
                      <Textarea
                        className="min-h-[140px] bg-[var(--color-panel-bg)]"
                        value={selectedRequestNotes}
                        onChange={(event) =>
                          setNotesDrafts((current) => ({
                            ...current,
                            [selectedRequest.id]: event.target.value,
                          }))
                        }
                        placeholder="Add internal notes for follow-up, customer preferences, or delivery details."
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        disabled={savingRequests || selectedRequest.status === 'contacted'}
                        onClick={() => handleRequestStatus(selectedRequest.id, 'contacted')}
                      >
                        <CheckCircle size={16} weight="bold" />
                        Mark contacted
                      </Button>
                      <Button
                        variant="outline"
                        disabled={savingRequests}
                        onClick={() => handleRequestNotesSave(selectedRequest.id)}
                      >
                        Save notes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
