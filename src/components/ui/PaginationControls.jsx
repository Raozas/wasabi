import { Button } from './button'

function buildVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])
  const visiblePages = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right)

  const items = []

  for (let index = 0; index < visiblePages.length; index += 1) {
    const page = visiblePages[index]
    const previousPage = visiblePages[index - 1]

    if (typeof previousPage === 'number' && page - previousPage > 1) {
      items.push(`ellipsis-${previousPage}`)
    }

    items.push(page)
  }

  return items
}

export function PaginationControls({
  currentPage,
  disabled = false,
  onPageChange,
  totalCount = 0,
  totalPages = 0,
}) {
  if (totalPages <= 1) {
    return null
  }

  const visiblePages = buildVisiblePages(currentPage, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-[var(--color-muted)]">
        Page {currentPage} of {totalPages}
        {totalCount > 0 ? ` · ${totalCount} products` : ''}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>

        {visiblePages.map((item) =>
          typeof item === 'string' ? (
            <span key={item} className="px-1 text-sm text-[var(--color-muted)]">
              ...
            </span>
          ) : (
            <Button
              key={item}
              variant={item === currentPage ? 'default' : 'outline'}
              size="sm"
              disabled={disabled}
              onClick={() => onPageChange(item)}
            >
              {item}
            </Button>
          ),
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={disabled || currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
