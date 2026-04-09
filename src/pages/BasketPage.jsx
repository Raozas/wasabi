import { Copy, InstagramLogo, Minus, PaperPlaneTilt, Plus, ShoppingBag, Trash } from '@phosphor-icons/react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../features/products/product.utils'
import { useCart } from '../hooks/useCart'
import { createPurchaseRequest } from '../services/firestore/purchase-requests'
import styles from './BasketPage.module.css'

const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/'

export function BasketPage() {
  const {
    cartItems,
    clearCart,
    decreaseQuantity,
    increaseQuantity,
    removeFromCart,
    totalItems,
    totalPrice,
    updateQuantity,
  } = useCart()
  const [copied, setCopied] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [instagramUsername, setInstagramUsername] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [requestError, setRequestError] = useState('')
  const [requestSuccess, setRequestSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [requestSaved, setRequestSaved] = useState(false)

  const orderSummary = useMemo(() => {
    const lines = ['Order summary', '']

    for (const item of cartItems) {
      lines.push(`${item.name}`)
      lines.push(`Quantity: ${item.quantity}`)
      lines.push(`Price: ${formatPrice(item.price)}`)
      lines.push(`Subtotal: ${formatPrice(item.price * item.quantity)}`)
      lines.push('')
    }

    lines.push(`Total items: ${totalItems}`)
    lines.push(`Total: ${formatPrice(totalPrice)}`)

    return lines.join('\n')
  }, [cartItems, totalItems, totalPrice])

  async function handleCopySummary() {
    try {
      await navigator.clipboard.writeText(orderSummary)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  async function saveRequest() {
    if (!customerName.trim() || !contactInfo.trim()) {
      setRequestError('Add your name or username and contact info before continuing.')
      setRequestSuccess('')
      return false
    }

    setRequestError('')
    setRequestSuccess('')

    try {
      await createPurchaseRequest({
        contactInfo,
        customerName,
        instagramUsername,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        orderSummary,
        totalItems,
        totalPrice,
      })

      await handleCopySummary()
      setRequestSaved(true)
      setRequestSuccess('Order request saved. You can now continue to Instagram.')
      return true
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : 'Failed to save your request.')
      return false
    }
  }

  async function handleOrder() {
    setSubmitting(true)

    try {
      await saveRequest()
    } finally {
      setSubmitting(false)
    }
  }

  function handleGoToBuy() {
    if (!requestSaved) {
      setRequestError('Click Order first so the admin can receive your contact details.')
      setRequestSuccess('')
      return
    }

    void handleCopySummary()
    window.open(instagramUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>
          <ShoppingBag size={16} weight="fill" />
          Basket
        </span>
        <h2 className={styles.title}>Manage your selected items</h2>
        <p className={styles.copy}>
          Review quantities, remove products, and keep track of your current total before checkout.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className={styles.emptyState}>
          <ShoppingBag size={38} weight="duotone" />
          <h3>Your basket is empty</h3>
          <p>Add products from the catalog to start building your order.</p>
          <Link className={styles.shopLink} to="/products">
            Go to shop
          </Link>
        </div>
      ) : (
        <div className={styles.layout}>
          <section className={styles.itemsCard}>
            {cartItems.map((item) => (
              <article key={item.id} className={styles.itemRow}>
                <div className={styles.itemInfo}>
                  <img className={styles.itemImage} src={item.photoUrl} alt={item.name} />
                  <div className={styles.itemText}>
                    <strong>{item.name}</strong>
                    <span>{formatPrice(item.price)}</span>
                  </div>
                </div>

                <div className={styles.quantity}>
                  <button type="button" onClick={() => decreaseQuantity(item.id)}>
                    <Minus size={16} weight="bold" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.id, event.target.value)}
                  />
                  <button type="button" onClick={() => increaseQuantity(item.id)}>
                    <Plus size={16} weight="bold" />
                  </button>
                </div>

                <div className={styles.subtotal}>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>

                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => removeFromCart(item.id)}
                >
                  <Trash size={16} weight="bold" />
                  Remove
                </button>
              </article>
            ))}
          </section>

          <aside className={styles.summaryCard}>
            <h3>Basket summary</h3>
            <div className={styles.summaryGrid}>
              <div className={styles.summaryStat}>
                <span>Total items</span>
                <strong>{totalItems}</strong>
              </div>
              <div className={styles.summaryStat}>
                <span>Products</span>
                <strong>{cartItems.length}</strong>
              </div>
            </div>
            <div className={styles.summaryTotal}>
              <span>Total price</span>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>
            <div className={styles.customerForm}>
              <div className={styles.formHeader}>
                <h4>Contact details</h4>
                <span className={styles.formHint}>Required before ordering</span>
              </div>
              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Name or username</span>
                  <input
                    value={customerName}
                    onChange={(event) => {
                      setCustomerName(event.target.value)
                      setRequestSaved(false)
                    }}
                  />
                </label>
                <label className={styles.field}>
                  <span>Instagram username</span>
                  <input
                    value={instagramUsername}
                    onChange={(event) => {
                      setInstagramUsername(event.target.value)
                      setRequestSaved(false)
                    }}
                    placeholder="@yourusername"
                  />
                </label>
              </div>
              <label className={styles.field}>
                <span>Contact info</span>
                <input
                  value={contactInfo}
                  onChange={(event) => {
                    setContactInfo(event.target.value)
                    setRequestSaved(false)
                  }}
                  placeholder="Phone number or Telegram"
                />
              </label>
              {requestError ? <p className={styles.error}>{requestError}</p> : null}
              {requestSuccess ? <p className={styles.success}>{requestSuccess}</p> : null}
            </div>
            <details className={styles.orderBox}>
              <summary className={styles.orderHeader}>
                <strong>Order text</strong>
                <button type="button" className={styles.copyButton} onClick={handleCopySummary}>
                  <Copy size={16} weight="bold" />
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </summary>
              <pre className={styles.orderSummary}>{orderSummary}</pre>
            </details>
            <div className={styles.actionStack}>
              <div className={styles.primaryActions}>
                <button
                  type="button"
                  className={styles.orderButton}
                  onClick={handleOrder}
                  disabled={submitting}
                >
                  <PaperPlaneTilt size={18} weight="fill" />
                  {submitting ? 'Saving request...' : 'Order'}
                </button>
                <button
                  type="button"
                  className={styles.buyButton}
                  onClick={handleGoToBuy}
                  disabled={!requestSaved}
                >
                  <InstagramLogo size={18} weight="fill" />
                  Go to Buy
                </button>
              </div>
              <button type="button" className={styles.clearButton} onClick={clearCart}>
                Clear basket
              </button>
            </div>
          </aside>
        </div>
      )}
    </section>
  )
}
