import { Button, Card } from '@heroui/react'
import { useNavigate } from 'react-router-dom'
import styles from './NotFoundPage.module.css'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <main className={styles.page}>
      <Card className={styles.card}>
        <Card.Content className={styles.content}>
          <p className={styles.code}>404</p>
          <h1>Page not found</h1>
          <p>The requested route is not part of the current app shell.</p>
          <Button color="primary" onClick={() => navigate('/')}>
            Return to overview
          </Button>
        </Card.Content>
      </Card>
    </main>
  )
}
