import { Link } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>
        <h1>Page not found</h1>
        <p>The requested route is not part of the current app shell.</p>
        <Link to="/" className={styles.link}>
          Return to overview
        </Link>
      </div>
    </main>
  )
}
