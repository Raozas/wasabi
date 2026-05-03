import { ADMIN_ROLES, COLLECTIONS, STORAGE_BUCKETS } from '../config/firebase-schema'
import styles from './DataModelsPage.module.css'

const productFields = [
  'id',
  'name',
  'barcode',
  'price',
  'isAvailable',
  'category',
  'subcategory',
  'photoUrl',
  'shortDescription',
  'externalProductId',
  'stock',
  'prices',
  'syncedAt',
  'createdAt',
  'updatedAt',
]

const adminFields = ['uid', 'name', 'email', 'role', 'createdAt', 'isActive']

export function DataModelsPage() {
  return (
    <section className={styles.page}>
      <article className={styles.card}>
        <span className={styles.eyebrow}>Firestore structure</span>
        <h2>Collections and storage paths are defined</h2>
        <p>
          Products live in <code>{COLLECTIONS.products}</code>, admin users live in{' '}
          <code>{COLLECTIONS.adminUsers}</code>, and product media uploads are grouped under{' '}
          <code>{STORAGE_BUCKETS.productImages}/{'{productId}'}</code>.
        </p>
      </article>

      <div className={styles.grid}>
        <article className={styles.card}>
          <h3>Product document</h3>
          <ul className={styles.list}>
            {productFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </article>

        <article className={styles.card}>
          <h3>Admin user document</h3>
          <ul className={styles.list}>
            {adminFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
          <p className={styles.note}>
            Valid roles: <strong>{ADMIN_ROLES.admin}</strong>,{' '}
            <strong>{ADMIN_ROLES.superadmin}</strong>
          </p>
        </article>
      </div>

      <article className={styles.card}>
        <h3>Implemented helpers</h3>
        <div className={styles.helperGrid}>
          <div>
            <p className={styles.helperTitle}>Products</p>
            <p>`listProducts`, `getProductById`, `createProduct`, `updateProduct`, `deleteProduct`</p>
          </div>
          <div>
            <p className={styles.helperTitle}>Admin users</p>
            <p>
              `listAdminUsers`, `getAdminUserByUid`, `createAdminUser`, `updateAdminUser`,
              `updateAdminUserRole`, `setAdminUserStatus`, `deleteAdminUser`
            </p>
          </div>
          <div>
            <p className={styles.helperTitle}>Images</p>
            <p>`uploadProductImage`, `deleteProductImage`, `createProductImagePath`</p>
          </div>
        </div>
      </article>
    </section>
  )
}
