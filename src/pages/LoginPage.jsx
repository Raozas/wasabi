import { EnvelopeSimple, LockKey, ShieldCheck } from '@phosphor-icons/react'
import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const {
    authError,
    clearAuthError,
    firebaseReady,
    hasAdminAccess,
    isSuperadmin,
    loading,
    signInAdmin,
    user,
  } = useAuth()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const from = location.state?.from ?? '/admin'
  const reason = location.state?.reason
  const isDisabled = !firebaseReady || submitting || loading

  if (hasAdminAccess) {
    return <Navigate to={from.startsWith('/admin/users') && !isSuperadmin ? '/admin' : from} replace />
  }

  let statusText =
    'Use your Firebase Authentication email and password to sign in as an admin or superadmin.'

  if (!firebaseReady) {
    statusText = 'Add your Firebase environment variables to enable Firebase Authentication.'
  } else if (loading && user) {
    statusText = 'Checking admin role for the current session.'
  } else if (reason === 'forbidden') {
    statusText = 'Your account signed in successfully, but it is not mapped to an active admin role.'
  } else if (reason === 'signin') {
    statusText = 'Sign in to continue to the protected admin area.'
  } else if (user) {
    statusText = `Signed in as ${user.email ?? user.uid}, resolving admin access.`
  }

  let disabledMessage = ''

  if (!firebaseReady) {
    disabledMessage = 'Sign-in is unavailable because Firebase credentials are missing.'
  } else if (loading) {
    disabledMessage = 'Sign-in will unlock after the current session check finishes.'
  } else if (submitting) {
    disabledMessage = 'Signing in...'
  }

  async function handleSubmit(event) {
    event.preventDefault()
    clearAuthError()
    setSubmitting(true)

    try {
      await signInAdmin(email.trim(), password)
    } catch {
      // AuthContext exposes the error message.
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <span className={styles.eyebrow}>
          <ShieldCheck size={16} weight="fill" />
          Secure sign in
        </span>
        <h2 className={styles.title}>Email/password access for admins</h2>
        <p className={styles.copy}>{statusText}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>Email</span>
            <div className={styles.inputWrap}>
              <EnvelopeSimple size={18} weight="duotone" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                autoComplete="email"
                required
              />
            </div>
          </label>

          <label className={styles.field}>
            <span>Password</span>
            <div className={styles.inputWrap}>
              <LockKey size={18} weight="duotone" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>
          </label>

          {authError ? <p className={styles.error}>{authError}</p> : null}
          {disabledMessage ? <p className={styles.hint}>{disabledMessage}</p> : null}

          <button type="submit" className={styles.submit} disabled={isDisabled}>
            {submitting ? 'Signing in...' : 'Sign in as admin'}
          </button>
        </form>
      </div>
    </section>
  )
}
