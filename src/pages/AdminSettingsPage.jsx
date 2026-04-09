import { GearSix, ShieldCheck, UserCircle } from '@phosphor-icons/react'
import { useAuth } from '../hooks/useAuth'
import styles from './AdminSettingsPage.module.css'

export function AdminSettingsPage() {
  const { adminProfile, user } = useAuth()

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
    </section>
  )
}
