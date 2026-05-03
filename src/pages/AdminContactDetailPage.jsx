import { ArrowLeft, CheckCircle } from '@phosphor-icons/react'
import { useCallback, useEffect, useState } from 'react'
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
import { Textarea } from '../components/ui/textarea'
import {
  CONVERSATION_RESULT_OPTIONS,
  getConversationResultMeta,
} from '../features/purchase-requests/conversation-results'
import { formatPrice } from '../features/products/product.utils'
import {
  getPurchaseRequest,
  updatePurchaseRequestConversationResult,
  updatePurchaseRequestNotes,
  updatePurchaseRequestStatus,
} from '../services/firestore/purchase-requests'

function LabeledField({ children, label }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

function getStatusBadgeClass(status) {
  return status === 'contacted'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200'
    : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200'
}

export function AdminContactDetailPage() {
  const navigate = useNavigate()
  const { requestId = '' } = useParams()
  const [purchaseRequest, setPurchaseRequest] = useState(null)
  const [notes, setNotes] = useState('')
  const [conversationResult, setConversationResult] = useState('')
  const [loadingRequest, setLoadingRequest] = useState(true)
  const [savingRequest, setSavingRequest] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState('')

  const loadPurchaseRequest = useCallback(async () => {
    setLoadingRequest(true)
    setRequestError('')

    try {
      const nextRequest = await getPurchaseRequest(requestId)

      if (!nextRequest) {
        setPurchaseRequest(null)
        setRequestError('Request not found.')
        return
      }

      setPurchaseRequest(nextRequest)
      setNotes(nextRequest.notes ?? '')
      setConversationResult(nextRequest.conversationResult ?? '')
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to load request.')
    } finally {
      setLoadingRequest(false)
    }
  }, [requestId])

  useEffect(() => {
    void loadPurchaseRequest()
  }, [loadPurchaseRequest])

  async function handleSaveNotes() {
    if (!purchaseRequest) {
      return
    }

    setSavingRequest(true)
    setRequestError('')
    setRequestSuccess('')

    try {
      await updatePurchaseRequestNotes(purchaseRequest.id, notes)
      await loadPurchaseRequest()
      setRequestSuccess('Request notes saved.')
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to save notes.')
    } finally {
      setSavingRequest(false)
    }
  }

  async function handleMarkContacted() {
    if (!purchaseRequest) {
      return
    }

    setSavingRequest(true)
    setRequestError('')
    setRequestSuccess('')

    try {
      await updatePurchaseRequestStatus(purchaseRequest.id, 'contacted')
      await loadPurchaseRequest()
      setRequestSuccess('Request marked as contacted.')
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to update request.')
    } finally {
      setSavingRequest(false)
    }
  }

  async function handleSaveConversationResult(nextConversationResult) {
    if (!purchaseRequest) {
      return
    }

    setSavingRequest(true)
    setRequestError('')
    setRequestSuccess('')

    try {
      await updatePurchaseRequestConversationResult(purchaseRequest.id, nextConversationResult)
      setConversationResult(nextConversationResult)
      await loadPurchaseRequest()
      setRequestSuccess('Conversation result saved.')
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to save conversation result.')
    } finally {
      setSavingRequest(false)
    }
  }

  const conversationResultMeta = getConversationResultMeta(
    purchaseRequest?.conversationResult ?? conversationResult,
  )
  const ConversationResultIcon = conversationResultMeta?.icon

  return (
    <section className="space-y-6">
      <Button className="w-fit" variant="ghost" onClick={() => navigate('/admin/contacts')}>
        <ArrowLeft size={18} weight="bold" />
        Back to requests
      </Button>

      <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(24,24,27,0.88))]">
        <CardHeader className="gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary">Request detail</Badge>
            <div>
              <CardTitle className="text-2xl">
                {purchaseRequest?.customerName || 'Purchase request'}
              </CardTitle>
              <CardDescription>
                Review customer details, order context, and internal follow-up notes.
              </CardDescription>
            </div>
          </div>

          {purchaseRequest ? (
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={getStatusBadgeClass(purchaseRequest.status)}>
                {purchaseRequest.status}
              </Badge>
              {conversationResultMeta ? (
                <Badge variant="outline" className={conversationResultMeta.className}>
                  {ConversationResultIcon ? <ConversationResultIcon size={14} weight="fill" /> : null}
                  {conversationResultMeta.label}
                </Badge>
              ) : null}
            </div>
          ) : null}
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

          {savingRequest ? (
            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] px-4 py-3 text-sm text-[var(--color-muted)]">
              Updating request...
            </div>
          ) : null}

          {loadingRequest ? (
            <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-soft)] text-sm text-[var(--color-muted)]">
              Loading request...
            </div>
          ) : null}

          {!loadingRequest && purchaseRequest ? (
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Contact
                    </p>
                    <p className="mt-2 text-sm font-medium">{purchaseRequest.contactInfo}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Instagram
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {purchaseRequest.instagramUsername || 'Not provided'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Total items
                    </p>
                    <p className="mt-2 text-sm font-medium">{purchaseRequest.totalItems}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-muted)]">
                      Total price
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {formatPrice(purchaseRequest.totalPrice)}
                    </p>
                  </div>
                </div>

                <LabeledField label="Order summary">
                  <Textarea
                    className="min-h-[200px] resize-none bg-[var(--color-panel-bg)]"
                    readOnly
                    value={purchaseRequest.orderSummary}
                  />
                </LabeledField>

                <LabeledField label="Staff notes">
                  <Textarea
                    className="min-h-[200px] bg-[var(--color-panel-bg)]"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Add internal notes for follow-up, customer preferences, or delivery details."
                  />
                </LabeledField>
              </div>

              <Card className="h-fit border border-[var(--color-border)] bg-[var(--color-panel-bg)]">
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                  <CardDescription>
                    Update the status and save the latest context for this request.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <LabeledField label="Status">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getStatusBadgeClass(purchaseRequest.status)}>
                        {purchaseRequest.status}
                      </Badge>
                      {conversationResultMeta ? (
                        <Badge variant="outline" className={conversationResultMeta.className}>
                          {ConversationResultIcon ? <ConversationResultIcon size={14} weight="fill" /> : null}
                          {conversationResultMeta.label}
                        </Badge>
                      ) : null}
                    </div>
                  </LabeledField>

                  <LabeledField label="Conversation result">
                    <div className="flex flex-wrap gap-2">
                      {CONVERSATION_RESULT_OPTIONS.map((option) => {
                        const isActive = conversationResult === option.value

                        return (
                          <Button
                            key={option.value}
                            variant={isActive ? 'secondary' : 'outline'}
                            className={isActive ? 'border-transparent' : ''}
                            disabled={savingRequest}
                            onClick={() => handleSaveConversationResult(option.value)}
                          >
                            <option.icon size={16} weight="fill" />
                            {option.label}
                          </Button>
                        )
                      })}
                    </div>
                  </LabeledField>

                  <div className="flex flex-col gap-3">
                    <Button
                      className="text-white disabled:bg-primary disabled:text-white disabled:opacity-100"
                      disabled={savingRequest || purchaseRequest.status === 'contacted'}
                      onClick={handleMarkContacted}
                    >
                      <CheckCircle size={16} weight="bold" />
                      Mark contacted
                    </Button>
                    <Button variant="outline" disabled={savingRequest} onClick={handleSaveNotes}>
                      Save notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  )
}
