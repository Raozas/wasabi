import { Button, Card, Chip, Spinner } from '@heroui/react'
import { FileCsv, Package } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseProductCsv } from '../features/products/product-import'
import { importProducts } from '../services/firestore/products'
import styles from './AdminProductImportPage.module.css'

export function AdminProductImportPage() {
  const navigate = useNavigate()
  const [csvFile, setCsvFile] = useState(null)
  const [importingProducts, setImportingProducts] = useState(false)
  const [importError, setImportError] = useState('')
  const [importSuccess, setImportSuccess] = useState('')
  const [importSummary, setImportSummary] = useState(null)

  function resetImportState() {
    setCsvFile(null)
    setImportError('')
    setImportSuccess('')
    setImportSummary(null)
  }

  async function handleCsvImport() {
    if (!csvFile) {
      setImportError('Choose a CSV file to import.')
      setImportSuccess('')
      return
    }

    setImportingProducts(true)
    setImportError('')
    setImportSuccess('')
    setImportSummary(null)

    try {
      const csvText = await csvFile.text()
      const parsedRows = parseProductCsv(csvText)
      const results = await importProducts(parsedRows)

      setImportSummary(results)
      setImportSuccess(
        results.createdCount > 0
          ? `Imported ${results.createdCount} product${results.createdCount === 1 ? '' : 's'}.`
          : 'No products were imported.',
      )
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import CSV.')
    } finally {
      setImportingProducts(false)
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.hero}>
        <Chip color="primary" variant="flat">
          <FileCsv size={16} weight="fill" />
          CSV import
        </Chip>
        <h2 className={styles.title}>Create products from CSV</h2>
        <p className={styles.copy}>
          Bulk-create products in a dedicated workspace, then return to the main admin inventory to
          review and edit them.
        </p>
      </div>

      <div className={styles.layout}>
        <Card className={styles.card}>
          <Card.Content>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionKicker}>
                  <Package size={16} weight="fill" />
                  Import setup
                </span>
                <h3>Prepare your product file</h3>
              </div>
              <Button type="button" variant="light" onClick={resetImportState}>
                Clear
              </Button>
            </div>

            <div className={styles.importGuide}>
              <p>Required columns: name, price, category, shortDescription.</p>
              <p>Optional columns: photoUrl, isAvailable.</p>
              <code className={styles.csvExample}>
                name,price,category,shortDescription,photoUrl,isAvailable
              </code>
              <p className={styles.helperText}>
                Products without a photo stay visible in the catalog with a placeholder. Admins can
                add or replace the image later from the main product editor.
              </p>
            </div>

            <div className={styles.form}>
              <label className={styles.field}>
                <span>Upload CSV</span>
                <div className={styles.uploadField}>
                  <FileCsv size={18} weight="bold" />
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)}
                  />
                </div>
              </label>

              {importError ? <p className={styles.error}>{importError}</p> : null}
              {importSuccess ? <p className={styles.success}>{importSuccess}</p> : null}

              <div className={styles.actions}>
                <Button
                  type="button"
                  color="primary"
                  onClick={handleCsvImport}
                  isDisabled={importingProducts}
                >
                  {importingProducts ? <Spinner size="sm" /> : <FileCsv size={18} weight="bold" />}
                  {importingProducts ? 'Importing...' : 'Import CSV'}
                </Button>

                <Button variant="bordered" onClick={() => navigate('/admin')}>
                  Back to admin
                </Button>
              </div>
            </div>
          </Card.Content>
        </Card>

        <Card className={styles.card}>
          <Card.Content>
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionKicker}>
                  <FileCsv size={16} weight="fill" />
                  Results
                </span>
                <h3>Import report</h3>
              </div>
            </div>

            {!importSummary ? (
              <div className={styles.state}>Import a CSV file to see row-level results.</div>
            ) : (
              <div className={styles.importSummary}>
                <div className={styles.importStats}>
                  <Chip color="success" variant="flat">{importSummary.createdCount} created</Chip>
                  <Chip color="danger" variant="flat">{importSummary.failedCount} failed</Chip>
                </div>
                {importSummary.errors.length > 0 ? (
                  <div className={styles.importErrors}>
                    {importSummary.errors.map((item) => (
                      <p key={`${item.rowNumber}-${item.message}`}>
                        Row {item.rowNumber}: {item.message}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className={styles.state}>All imported rows passed validation.</div>
                )}
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </section>
  )
}
