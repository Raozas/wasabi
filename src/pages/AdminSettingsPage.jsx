import { GearSix, Moon, Palette, ShieldCheck, UserCircle } from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import styles from './AdminSettingsPage.module.css'

export function AdminSettingsPage() {
  const { adminProfile, user } = useAuth()
  const { darkThemeVariant, isDarkMode, setDarkThemeVariant, setThemeMode } = useTheme()

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.eyebrow}>Settings</span>
        <h2 className={styles.title}>Account overview</h2>
      </div>

      <div className={styles.grid}>
        <article className={styles.card}>
          <UserCircle size={24} weight="duotone" className={styles.icon} />
          <h3>Account</h3>
          <p>{adminProfile?.name || user?.email || user?.uid}</p>
        </article>

        <article className={styles.card}>
          <ShieldCheck size={24} weight="duotone" className={styles.icon} />
          <h3>Role</h3>
          <p>{adminProfile?.role || 'No role'}</p>
        </article>

        <article className={styles.card}>
          <GearSix size={24} weight="duotone" className={styles.icon} />
          <h3>Email</h3>
          <p>{adminProfile?.email || user?.email || 'No email'}</p>
        </article>
      </div>

      <section className={styles.preferenceCard}>
        <div className={styles.preferenceHeader}>
          <div>
            <span className={styles.preferenceKicker}>
              <Moon size={16} weight="fill" />
              Display
            </span>
            <h3>Dark mode style</h3>
          </div>
          <button type="button" className={styles.previewButton} onClick={() => setThemeMode('dark')}>
            Preview dark mode
          </button>
        </div>

        <p className={styles.preferenceCopy}>
          Choose which palette should be used whenever dark mode is enabled.
          {isDarkMode ? ' Dark mode is currently active.' : ' Dark mode is currently off.'}
        </p>

        <div className={styles.optionGrid}>
          <button
            type="button"
            className={darkThemeVariant === 'default' ? `${styles.optionCard} ${styles.optionCardActive}` : styles.optionCard}
            onClick={() => setDarkThemeVariant('default')}
          >
            <span className={styles.optionIcon}>
              <Palette size={18} weight="duotone" />
            </span>
            <strong>Default dark</strong>
            <p>Near-black surfaces with neutral contrast.</p>
            <div className={styles.swatches}>
              <span style={{ background: '#09090b' }} />
              <span style={{ background: '#18181b' }} />
              <span style={{ background: '#3f3f46' }} />
              <span style={{ background: '#d4d4d8' }} />
            </div>
          </button>

          <button
            type="button"
            className={darkThemeVariant === 'blue' ? `${styles.optionCard} ${styles.optionCardActive}` : styles.optionCard}
            onClick={() => setDarkThemeVariant('blue')}
          >
            <span className={styles.optionIcon}>
              <Palette size={18} weight="duotone" />
            </span>
            <strong>Blue dark</strong>
            <p>Ocean-toned dark mode using the current blue palette.</p>
            <div className={styles.swatches}>
              <span style={{ background: '#03045e' }} />
              <span style={{ background: '#0077b6' }} />
              <span style={{ background: '#00b4d8' }} />
              <span style={{ background: '#90e0ef' }} />
              <span style={{ background: '#caf0f8' }} />
            </div>
          </button>
        </div>
      </section>
    </section>
  )
}
