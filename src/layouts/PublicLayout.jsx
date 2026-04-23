import { Button, ButtonGroup, Chip } from '@heroui/react'
import { Moon, ShoppingBag, SunDim } from '@phosphor-icons/react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { UserMenu } from '../components/auth/UserMenu'
import { ProductBrowseTools } from '../components/products/ProductBrowseTools'
import { useCart } from '../hooks/useCart'
import { useTheme } from '../hooks/useTheme'
import styles from './PublicLayout.module.css'

const PUBLIC_NAV_ITEMS = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Basket', to: '/basket' },
]

export function PublicLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { totalItems } = useCart()
  const { isDarkMode, toggleThemeMode } = useTheme()
  const isProductRoute = location.pathname === '/products'

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <button type="button" className={styles.logoWrap} onClick={() => navigate('/')}>
          <span className={styles.logoBadge}>W</span>
          <div>
            <p className={styles.kicker}>Wasabi Commerce</p>
            <strong className={styles.brand}>Wasabi Shop</strong>
          </div>
        </button>

        <div className={styles.navWrap}>
          <ButtonGroup variant="bordered" className={styles.navGroup}>
            {PUBLIC_NAV_ITEMS.map((item) => {
              const isActive = item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)

              return (
                <Button
                  key={item.to}
                  color={isActive ? 'primary' : 'default'}
                  variant={isActive ? 'solid' : 'light'}
                  onClick={() => navigate(item.to)}
                  className={styles.navButton}
                >
                  {item.label}
                  {item.to === '/basket' && totalItems > 0 ? (
                    <Chip size="sm" color="primary" variant="flat">
                      {totalItems}
                    </Chip>
                  ) : null}
                </Button>
              )
            })}
          </ButtonGroup>
        </div>

        <div className={styles.actions}>
          <Button
            isIconOnly
            variant="light"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleThemeMode}
          >
            {isDarkMode ? <SunDim size={18} weight="bold" /> : <Moon size={18} weight="bold" />}
          </Button>
          <UserMenu />
        </div>
      </header>

      {isProductRoute ? (
        <section className={styles.toolsBar}>
          <ProductBrowseTools />
        </section>
      ) : null}

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  )
}
