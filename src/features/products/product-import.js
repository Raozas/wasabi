import { createProductPayload } from './product.model'

function parseCsvLine(line) {
  const values = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index]
    const nextCharacter = line[index + 1]

    if (character === '"') {
      if (inQuotes && nextCharacter === '"') {
        current += '"'
        index += 1
      } else {
        inQuotes = !inQuotes
      }

      continue
    }

    if (character === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += character
  }

  if (inQuotes) {
    throw new Error('Unclosed quote detected.')
  }

  values.push(current)
  return values
}

function parseCsv(text) {
  const normalizedText = String(text ?? '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n')
  const rows = []
  let current = ''
  let inQuotes = false

  for (let index = 0; index < normalizedText.length; index += 1) {
    const character = normalizedText[index]
    const nextCharacter = normalizedText[index + 1]

    if (character === '"') {
      current += character

      if (inQuotes && nextCharacter === '"') {
        current += nextCharacter
        index += 1
      } else {
        inQuotes = !inQuotes
      }

      continue
    }

    if (character === '\n' && !inQuotes) {
      rows.push(parseCsvLine(current))
      current = ''
      continue
    }

    current += character
  }

  if (current.length > 0) {
    rows.push(parseCsvLine(current))
  }

  return rows.filter((row) => row.some((value) => String(value).trim().length > 0))
}

function normalizeColumnName(value) {
  return String(value ?? '').trim().toLowerCase()
}

function getRowObject(headers, row) {
  return headers.reduce((result, header, index) => {
    result[header] = String(row[index] ?? '').trim()
    return result
  }, {})
}

function parseBoolean(value) {
  const normalizedValue = String(value ?? '').trim().toLowerCase()

  if (!normalizedValue) {
    return undefined
  }

  if (['true', '1', 'yes', 'y'].includes(normalizedValue)) {
    return true
  }

  if (['false', '0', 'no', 'n'].includes(normalizedValue)) {
    return false
  }

  throw new Error('isAvailable must be true or false.')
}

function validateRequiredColumns(headers) {
  const requiredColumns = ['name', 'price', 'category', 'shortdescription']
  const missingColumns = requiredColumns.filter((column) => !headers.includes(column))

  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}.`)
  }
}

export function parseProductCsv(text) {
  const rows = parseCsv(text)

  if (rows.length === 0) {
    throw new Error('The CSV file is empty.')
  }

  const headers = rows[0].map(normalizeColumnName)
  validateRequiredColumns(headers)

  return rows.slice(1).map((row, rowIndex) => {
    const sourceRow = getRowObject(headers, row)

    try {
      const name = sourceRow.name ?? ''
      const category = sourceRow.category ?? ''
      const shortDescription = sourceRow.shortdescription ?? ''
      const photoUrl = sourceRow.photourl ?? ''
      const rawPrice = sourceRow.price ?? ''
      const isAvailable = parseBoolean(sourceRow.isavailable)

      if (!name) {
        throw new Error('Name is required.')
      }

      if (!category) {
        throw new Error('Category is required.')
      }

      if (!shortDescription) {
        throw new Error('Short description is required.')
      }

      if (!rawPrice) {
        throw new Error('Price is required.')
      }

      const payloadInput = {
        category,
        name,
        photoUrl,
        price: Number(rawPrice),
        shortDescription,
      }

      if (typeof isAvailable === 'boolean') {
        payloadInput.isAvailable = isAvailable
      }

      const payload = createProductPayload(payloadInput)

      return {
        payload,
        row: sourceRow,
        rowNumber: rowIndex + 2,
      }
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Invalid product row.',
        row: sourceRow,
        rowNumber: rowIndex + 2,
      }
    }
  })
}
