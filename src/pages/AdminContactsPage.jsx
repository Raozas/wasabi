import { Button, Card, Chip, Spinner, TextArea } from '@heroui/react'
import { ChatCircleDots, CheckCircle, DownloadSimple, X } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
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
import styles from './AdminContactsPage.module.css'

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

    return nextNotes.length > 15 ? `${nextNotes.slice(0, 15)}...` : nextNotes
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <Chip color="primary" variant="flat">
          <ChatCircleDots size={16} weight="fill" />
          Customer contacts
        </Chip>
        <h2 className={styles.title}>Recent customer contacts</h2>
        <p className={styles.copy}>
          Review incoming purchase requests, check order details, and mark customers as contacted.
        </p>
      </div>

      <Card className={styles.card}>
        <Card.Content>
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.sectionKicker}>
                <ChatCircleDots size={16} weight="fill" />
                Leads
              </span>
              <h3>All requests</h3>
            </div>
            <div className={styles.headerActions}>
              <Button
                type="button"
                variant="bordered"
                onClick={() => exportPurchaseRequestsCsv(purchaseRequests)}
                isDisabled={purchaseRequests.length === 0}
              >
                <DownloadSimple size={16} weight="bold" />
                Export CSV
              </Button>
              <Button
                type="button"
                variant="bordered"
                onClick={() => exportPurchaseRequestsXlsx(purchaseRequests)}
                isDisabled={purchaseRequests.length === 0}
              >
                <DownloadSimple size={16} weight="bold" />
                Export XLSX
              </Button>
              <Chip variant="flat">{purchaseRequests.length}</Chip>
            </div>
          </div>

          {requestError ? <p className={styles.error}>{requestError}</p> : null}
          {requestSuccess ? <p className={styles.success}>{requestSuccess}</p> : null}
          {savingRequests ? (
            <p className={styles.pending}>
              <Spinner size="sm" />
              Updating request...
            </p>
          ) : null}
          {loadingRequests ? <div className={styles.state}>Loading requests...</div> : null}
          {!loadingRequests && purchaseRequests.length === 0 ? (
            <div className={styles.state}>No purchase requests yet.</div>
          ) : null}

          {!loadingRequests && purchaseRequests.length > 0 ? (
            <div className={selectedRequest ? styles.workspace : styles.workspaceCollapsed}>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseRequests.map((request) => {
                      const isSelected = request.id === selectedRequestId

                      return (
                        <tr
                          key={request.id}
                          className={isSelected ? styles.rowActive : ''}
                          onClick={() => setSelectedRequestId(request.id)}
                        >
                          <td>
                            <div className={styles.primaryCell}>
                              <strong>{request.customerName || 'Unnamed customer'}</strong>
                              <span>{request.instagramUsername || 'No Instagram username'}</span>
                            </div>
                          </td>
                          <td className={styles.compactCell}>{request.contactInfo}</td>
                          <td className={styles.compactCell}>{request.totalItems}</td>
                          <td className={styles.compactCell}>{formatPrice(request.totalPrice)}</td>
                          <td>
                            <Chip color={request.status === 'contacted' ? 'success' : 'warning'} variant="flat">
                              {request.status}
                            </Chip>
                          </td>
                          <td className={styles.notesPreview}>{getNotesPreview(request)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {selectedRequest ? (
                <aside className={styles.detailPanel}>
                  <div className={styles.detailHeader}>
                    <div>
                      <span className={styles.detailKicker}>Selected request</span>
                      <h3>{selectedRequest.customerName || 'Unnamed customer'}</h3>
                    </div>
                    <div className={styles.detailHeaderActions}>
                      <Chip color={selectedRequest.status === 'contacted' ? 'success' : 'warning'} variant="flat">
                        {selectedRequest.status}
                      </Chip>
                      <Button
                        isIconOnly
                        type="button"
                        variant="light"
                        onClick={() => setSelectedRequestId('')}
                        aria-label="Close request details"
                      >
                        <X size={16} weight="bold" />
                      </Button>
                    </div>
                  </div>

                  <div className={styles.detailGrid}>
                    <div className={styles.detailStat}>
                      <span>Contact</span>
                      <strong>{selectedRequest.contactInfo}</strong>
                    </div>
                    <div className={styles.detailStat}>
                      <span>Instagram</span>
                      <strong>{selectedRequest.instagramUsername || 'Not provided'}</strong>
                    </div>
                    <div className={styles.detailStat}>
                      <span>Total items</span>
                      <strong>{selectedRequest.totalItems}</strong>
                    </div>
                    <div className={styles.detailStat}>
                      <span>Total price</span>
                      <strong>{formatPrice(selectedRequest.totalPrice)}</strong>
                    </div>
                  </div>

                  <div className={styles.detailBlock}>
                    <span className={styles.detailLabel}>Order summary</span>
                    <TextArea readOnly value={selectedRequest.orderSummary} minRows={6} />
                  </div>

                  <div className={styles.detailBlock}>
                    <span className={styles.detailLabel}>Staff notes</span>
                    <TextArea
                      minRows={6}
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

                  <div className={styles.actions}>
                    <Button
                      type="button"
                      color="primary"
                      onClick={() => handleRequestStatus(selectedRequest.id, 'contacted')}
                      isDisabled={savingRequests || selectedRequest.status === 'contacted'}
                    >
                      <CheckCircle size={16} weight="bold" />
                      Mark contacted
                    </Button>
                    <Button
                      type="button"
                      variant="bordered"
                      onClick={() => handleRequestNotesSave(selectedRequest.id)}
                      isDisabled={savingRequests}
                    >
                      Save notes
                    </Button>
                  </div>
                </aside>
              ) : null}
            </div>
          ) : null}
        </Card.Content>
      </Card>
    </section>
  )
}
