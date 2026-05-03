import { FileCsv, Package } from '@phosphor-icons/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card'
import { parseProductCsv } from '../features/products/product-import'
import { importProducts } from '../services/firestore/products'

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
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(24,24,27,0.88))]">
          <CardHeader className="gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Badge variant="secondary">
                  <FileCsv size={14} weight="fill" />
                  CSV import
                </Badge>
                <div>
                  <CardTitle className="text-2xl">Create products from CSV</CardTitle>
                  <CardDescription>
                    Bulk-create products in a dedicated workspace, then review and polish them from
                    the main inventory table.
                  </CardDescription>
                </div>
              </div>
              <Button variant="ghost" onClick={resetImportState}>
                Clear
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold">Required columns</p>
                <p className="text-sm text-[var(--color-muted)]">
                  name, price, category, shortDescription
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Optional columns</p>
                <p className="text-sm text-[var(--color-muted)]">photoUrl, isAvailable</p>
              </div>
              <div className="overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-strong)] px-3 py-2 font-mono text-xs text-[var(--color-muted)]">
                name,price,category,shortDescription,photoUrl,isAvailable
              </div>
              <p className="text-sm text-[var(--color-muted)]">
                Products without a photo remain visible with a placeholder. You can add or replace
                the image later from the product editor.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-medium">Upload CSV</span>
                <div className="flex items-center gap-3 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-panel-bg)] px-4 py-4">
                  <FileCsv size={18} weight="bold" className="text-[var(--color-accent)]" />
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={(event) => setCsvFile(event.target.files?.[0] ?? null)}
                    className="w-full text-sm"
                  />
                </div>
              </label>

              {importError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-950 dark:bg-red-950/30 dark:text-red-200">
                  {importError}
                </div>
              ) : null}

              {importSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200">
                  {importSuccess}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button disabled={importingProducts} onClick={handleCsvImport}>
                  <FileCsv size={18} weight="bold" />
                  {importingProducts ? 'Importing...' : 'Import CSV'}
                </Button>
                <Button variant="outline" onClick={() => navigate('/admin')}>
                  Back to admin
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(255,255,255,0.78))] dark:bg-[linear-gradient(180deg,rgba(24,24,27,0.96),rgba(24,24,27,0.88))]">
          <CardHeader className="space-y-2">
            <Badge variant="secondary">
              <Package size={14} weight="fill" />
              Import report
            </Badge>
            <div>
              <CardTitle className="text-2xl">Validation results</CardTitle>
              <CardDescription>
                Confirm how many rows were created successfully and inspect the failures before your
                next upload.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {!importSummary ? (
              <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-card-soft)] px-6 text-center text-sm text-[var(--color-muted)]">
                Import a CSV file to see row-level results.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-emerald-600 text-white dark:bg-emerald-500" variant="default">
                    {importSummary.createdCount} created
                  </Badge>
                  <Badge variant="destructive">{importSummary.failedCount} failed</Badge>
                </div>

                {importSummary.errors.length > 0 ? (
                  <div className="max-h-[420px] space-y-2 overflow-auto rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] p-4 text-sm">
                    {importSummary.errors.map((item) => (
                      <p key={`${item.rowNumber}-${item.message}`}>
                        <span className="font-semibold">Row {item.rowNumber}:</span> {item.message}
                      </p>
                    ))}
                  </div>
                ) : (
                  <div className="grid min-h-48 place-items-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] text-sm text-[var(--color-muted)]">
                    All imported rows passed validation.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
