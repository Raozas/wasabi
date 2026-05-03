import {
  ArrowSquareOut,
  GearSix,
  ShieldCheck,
  SignOut,
  UserCircle,
  UsersThree,
} from '@phosphor-icons/react'
import { Avatar, Button, Dropdown } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import styles from './UserMenu.module.css'

export function UserMenu() {
  const { adminProfile, isSuperadmin, loading, signOutUser, user } = useAuth()
  const navigate = useNavigate()

  const statusText = loading ? 'Checking' : user ? 'Signed in' : 'Guest'
  const userName = adminProfile?.name || user?.displayName || user?.email || 'Guest'
  const roleName = adminProfile?.role || 'guest'

  if (!user) {
    return (
      <Button
        color="primary"
        variant="solid"
        startContent={<UserCircle size={20} weight="duotone" />}
        className={styles.guestButton}
        onClick={() => navigate('/login')}
      >
        <span>{statusText}</span>
      </Button>
    )
  }

  return (
    <Dropdown.Root>
      <Dropdown.Trigger className={styles.trigger}>
        <span className={styles.triggerInner}>
          <Avatar size="sm" name={userName} />
          <span className={styles.triggerText}>
            <strong>{userName}</strong>
            <span>{roleName}</span>
          </span>
        </span>
        <ArrowSquareOut size={16} weight="bold" />
      </Dropdown.Trigger>
      <Dropdown.Popover>
        <Dropdown.Menu
          aria-label="User actions"
          onAction={(key) => {
            if (key === 'admin') {
              navigate('/admin')
            }

            if (key === 'settings') {
              navigate('/admin/settings')
            }

            if (key === 'admins') {
              navigate('/admin/users')
            }

            if (key === 'logout') {
              void signOutUser()
            }
          }}
        >
          <Dropdown.Section>
            <Dropdown.Item id="profile">
              <div className={styles.profileRow}>
                <Avatar name={userName} />
                <div className={styles.profileText}>
                  <strong>{userName}</strong>
                  <span>{statusText}</span>
                </div>
              </div>
            </Dropdown.Item>
          </Dropdown.Section>
          <Dropdown.Section title="Workspace">
            <Dropdown.Item id="admin" textValue="Admin">
              <span className={styles.menuItem}>
                <ShieldCheck size={18} weight="bold" />
                Admin
              </span>
            </Dropdown.Item>
            <Dropdown.Item id="settings" textValue="Settings">
              <span className={styles.menuItem}>
                <GearSix size={18} weight="bold" />
                Settings
              </span>
            </Dropdown.Item>
            {isSuperadmin ? (
              <Dropdown.Item id="admins" textValue="Admins">
                <span className={styles.menuItem}>
                  <UsersThree size={18} weight="bold" />
                  Admins
                </span>
              </Dropdown.Item>
            ) : null}
          </Dropdown.Section>
          <Dropdown.Section>
            <Dropdown.Item id="logout" textValue="Sign out">
              <span className={styles.menuItem}>
                <SignOut size={18} weight="bold" />
                Sign out
              </span>
            </Dropdown.Item>
          </Dropdown.Section>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown.Root>
  )
}
