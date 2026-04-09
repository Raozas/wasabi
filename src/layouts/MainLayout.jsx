import {
  House,
  Moon,
  ShieldCheck,
  ShoppingBag,
  ShoppingBagOpen,
  SunDim,
  UsersThree,
} from '@phosphor-icons/react'
import { NavLink, Outlet } from 'react-router-dom'
import { UserMenu } from '../components/auth/UserMenu'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useTheme } from '../hooks/useTheme'
import styles from './MainLayout.module.css'

export function MainLayout() {
  const { totalItems } = useCart()
  const { hasAdminAccess, isSuperadmin } = useAuth()
  const { isDarkMode, toggleThemeMode } = useTheme()
  const navItems = [
    { to: '/', label: 'Overview', icon: House },
    { to: '/products', label: 'Shop', icon: ShoppingBagOpen },
    { to: '/basket', label: 'Basket', icon: ShoppingBag },
    ...(hasAdminAccess ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck }] : []),
    ...(isSuperadmin ? [{ to: '/admin/users', label: 'Admins', icon: UsersThree }] : []),
  ]

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>Wasabi Commerce</p>
          <h1 className={styles.title}>Wasabi Shop</h1>
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.themeToggle} onClick={toggleThemeMode}>
            {isDarkMode ? <SunDim size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
            <span>{isDarkMode ? 'Light mode' : 'Dark mode'}</span>
          </button>
          <UserMenu />
        </div>
      </header>

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink
                }
              >
                <item.icon size={18} weight="duotone" />
                {item.label}
                {item.to === '/basket' && totalItems > 0 ? (
                  <span className={styles.navBadge}>{totalItems}</span>
                ) : null}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
