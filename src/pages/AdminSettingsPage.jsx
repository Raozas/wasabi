import { Avatar, Button, Card, Chip } from '@heroui/react'
import { GearSix, Moon, Palette, ShieldCheck } from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import styles from './AdminSettingsPage.module.css'

export function AdminSettingsPage() {
  const { adminProfile, user } = useAuth()
  const { darkThemeVariant, isDarkMode, setDarkThemeVariant, setThemeMode } = useTheme()

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <Chip color="primary" variant="flat">
          Settings
        </Chip>
        <h2 className={styles.title}>Account overview</h2>
      </div>

      <div className={styles.grid}>
        <Card className={styles.card}>
          <Card.Content className={styles.cardContent}>
            <Avatar name={adminProfile?.name || user?.email || user?.uid} />
            <h3>Account</h3>
            <p>{adminProfile?.name || user?.email || user?.uid}</p>
          </Card.Content>
        </Card>

        <Card className={styles.card}>
          <Card.Content className={styles.cardContent}>
            <ShieldCheck size={24} weight="duotone" className={styles.icon} />
            <h3>Role</h3>
            <p>{adminProfile?.role || 'No role'}</p>
          </Card.Content>
        </Card>

        <Card className={styles.card}>
          <Card.Content className={styles.cardContent}>
            <GearSix size={24} weight="duotone" className={styles.icon} />
            <h3>Email</h3>
            <p>{adminProfile?.email || user?.email || 'No email'}</p>
          </Card.Content>
        </Card>
      </div>

      <Card className={styles.preferenceCard}>
        <Card.Content>
          <div className={styles.preferenceHeader}>
            <div>
              <span className={styles.preferenceKicker}>
                <Moon size={16} weight="fill" />
                Display
              </span>
              <h3>Dark mode style</h3>
            </div>
            <Button type="button" variant="bordered" onClick={() => setThemeMode('dark')}>
              Preview dark mode
            </Button>
          </div>

          <p className={styles.preferenceCopy}>
            Choose which palette should be used whenever dark mode is enabled.
            {isDarkMode ? ' Dark mode is currently active.' : ' Dark mode is currently off.'}
          </p>

          <div className={styles.optionGrid}>
            <Button
              type="button"
              variant={darkThemeVariant === 'default' ? 'solid' : 'bordered'}
              color={darkThemeVariant === 'default' ? 'primary' : 'default'}
              className={styles.optionCard}
              onClick={() => setDarkThemeVariant('default')}
            >
              <span className={styles.optionIcon}>
                <Palette size={18} weight="duotone" />
              </span>
              <span className={styles.optionText}>
                <strong>Default dark</strong>
                <span>Near-black surfaces with neutral contrast.</span>
              </span>
            </Button>

            <Button
              type="button"
              variant={darkThemeVariant === 'blue' ? 'solid' : 'bordered'}
              color={darkThemeVariant === 'blue' ? 'primary' : 'default'}
              className={styles.optionCard}
              onClick={() => setDarkThemeVariant('blue')}
            >
              <span className={styles.optionIcon}>
                <Palette size={18} weight="duotone" />
              </span>
              <span className={styles.optionText}>
                <strong>Blue dark</strong>
                <span>Ocean-toned dark mode using the current blue palette.</span>
              </span>
            </Button>
          </div>
        </Card.Content>
      </Card>
    </section>
  )
}
