import {
  CaretDown,
  GearSix,
  House,
  ShieldCheck,
  SignOut,
  UserCircle,
  UsersThree,
} from '@phosphor-icons/react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './UserMenu.module.css'

export function UserMenu() {
  const { adminProfile, isSuperadmin, loading, signOutUser, user } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  const statusText = loading ? 'Checking' : user ? 'Signed in' : 'Guest'
  const userName = adminProfile?.name || user?.displayName || user?.email || 'Guest'
  const roleName = adminProfile?.role || 'guest'

  useEffect(() => {
    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  if (!user) {
    return (
      <Link className={styles.guestLink} to="/login">
        <UserCircle size={20} weight="duotone" />
        <span>{statusText}</span>
      </Link>
    )
  }

  return (
    <div className={styles.wrap} ref={menuRef}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <UserCircle size={22} weight="duotone" />
        <span className={styles.triggerText}>{statusText}</span>
        <CaretDown size={16} weight="bold" />
      </button>

      {open ? (
        <div className={styles.dropdown} role="menu">
          <div className={styles.profile}>
            <div className={styles.avatar}>
              <UserCircle size={28} weight="duotone" />
            </div>
            <div className={styles.profileText}>
              <strong>{userName}</strong>
              <span>{roleName}</span>
            </div>
          </div>

          <Link className={styles.menuLink} to="/admin/settings" onClick={() => setOpen(false)}>
            <GearSix size={18} weight="bold" />
            <span>Settings</span>
          </Link>

          <Link className={styles.menuLink} to="/admin" onClick={() => setOpen(false)}>
            <ShieldCheck size={18} weight="bold" />
            <span>Admin</span>
          </Link>

          <Link className={styles.menuLink} to="/" onClick={() => setOpen(false)}>
            <House size={18} weight="bold" />
            <span>Open site</span>
          </Link>

          {isSuperadmin ? (
            <Link className={styles.menuLink} to="/admin/users" onClick={() => setOpen(false)}>
              <UsersThree size={18} weight="bold" />
              <span>Admins</span>
            </Link>
          ) : null}

          <button
            type="button"
            className={styles.menuButton}
            onClick={() => {
              setOpen(false)
              signOutUser()
            }}
          >
            <SignOut size={18} weight="bold" />
            <span>Sign out</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}
