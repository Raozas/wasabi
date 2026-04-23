import { Avatar, Button, Card, Chip } from '@heroui/react'
import {
  ChatCircleDots,
  GearSix,
  House,
  Package,
  ShieldCheck,
  UsersThree,
} from '@phosphor-icons/react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './AdminLayout.module.css'

const ADMIN_NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: Package },
  { label: 'Contacts', to: '/admin/contacts', icon: ChatCircleDots },
  { label: 'Import', to: '/admin/products/import', icon: Package },
  { label: 'Settings', to: '/admin/settings', icon: GearSix },
]

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { adminProfile, isSuperadmin, user } = useAuth()

  const navItems = isSuperadmin
    ? [...ADMIN_NAV_ITEMS, { label: 'Admins', to: '/admin/users', icon: UsersThree }]
    : ADMIN_NAV_ITEMS

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div>
            <p className={styles.kicker}>Admin workspace</p>
            <h1 className={styles.title}>Wasabi Control</h1>
          </div>
          <Chip color="primary" variant="flat">
            {adminProfile?.role ?? 'admin'}
          </Chip>
        </div>

        <Card className={styles.profileCard}>
          <Card.Content className={styles.profileContent}>
            <Avatar
              name={adminProfile?.name || user?.email || 'Admin'}
              className={styles.avatar}
            />
            <div>
              <strong>{adminProfile?.name || 'Admin user'}</strong>
              <p>{adminProfile?.email || user?.email || user?.uid}</p>
            </div>
          </Card.Content>
        </Card>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = item.to === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.to)

            return (
              <Button
                key={item.to}
                variant={isActive ? 'solid' : 'light'}
                color={isActive ? 'primary' : 'default'}
                startContent={<item.icon size={18} weight="duotone" />}
                className={styles.navButton}
                onClick={() => navigate(item.to)}
              >
                {item.label}
              </Button>
            )
          })}
        </nav>

        <div className={styles.sidebarActions}>
          <Button
            variant="bordered"
            startContent={<House size={18} weight="duotone" />}
            onClick={() => navigate('/')}
          >
            Open storefront
          </Button>
        </div>
      </aside>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
