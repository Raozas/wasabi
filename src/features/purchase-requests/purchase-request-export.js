import { formatPrice } from '../products/product.utils'

const encoder = new TextEncoder()

function encodeText(value) {
  return encoder.encode(String(value))
}

function escapeCsvValue(value) {
  const normalizedValue = String(value ?? '')

  if (/[",\n]/.test(normalizedValue)) {
    return `"${normalizedValue.replace(/"/g, '""')}"`
  }

  return normalizedValue
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function normalizeDate(value) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return ''
  }

  return value.toLocaleString()
}

function buildRows(requests) {
  return requests.map((request) => ({
    contact: request.contactInfo ?? '',
    createdAt: normalizeDate(request.createdAt),
    customer: request.customerName || 'Unnamed customer',
    instagram: request.instagramUsername || 'Not provided',
    notes: request.notes ?? '',
    orderSummary: request.orderSummary ?? '',
    status: request.status ?? '',
    totalItems: request.totalItems ?? 0,
    totalPrice: formatPrice(request.totalPrice ?? 0),
  }))
}

function triggerDownload(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = objectUrl
  anchor.download = fileName
  anchor.click()

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0)
}

export function exportPurchaseRequestsCsv(requests) {
  const rows = buildRows(requests)
  const headers = ['Customer', 'Contact', 'Instagram', 'Items', 'Total', 'Status', 'Notes', 'Order summary', 'Created at']
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      [
        row.customer,
        row.contact,
        row.instagram,
        row.totalItems,
        row.totalPrice,
        row.status,
        row.notes,
        row.orderSummary,
        row.createdAt,
      ]
        .map(escapeCsvValue)
        .join(','),
    ),
  ]

  triggerDownload(new Blob([`\uFEFF${csvLines.join('\n')}`], { type: 'text/csv;charset=utf-8;' }), 'contacts-export.csv')
}

function makeCrcTable() {
  const table = new Uint32Array(256)

  for (let index = 0; index < 256; index += 1) {
    let current = index

    for (let step = 0; step < 8; step += 1) {
      current = (current & 1) !== 0 ? 0xedb88320 ^ (current >>> 1) : current >>> 1
    }

    table[index] = current >>> 0
  }

  return table
}

const crcTable = makeCrcTable()

function crc32(bytes) {
  let crc = 0xffffffff

  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }

  return (crc ^ 0xffffffff) >>> 0
}

function writeUint16(view, offset, value) {
  view.setUint16(offset, value, true)
}

function writeUint32(view, offset, value) {
  view.setUint32(offset, value, true)
}

function concatArrays(chunks) {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const result = new Uint8Array(totalLength)
  let offset = 0

  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
}

function createZip(files) {
  let offset = 0
  const localChunks = []
  const centralChunks = []

  for (const file of files) {
    const fileNameBytes = encodeText(file.name)
    const dataBytes = encodeText(file.content)
    const crc = crc32(dataBytes)

    const localHeader = new Uint8Array(30 + fileNameBytes.length)
    const localView = new DataView(localHeader.buffer)

    writeUint32(localView, 0, 0x04034b50)
    writeUint16(localView, 4, 20)
    writeUint16(localView, 6, 0)
    writeUint16(localView, 8, 0)
    writeUint16(localView, 10, 0)
    writeUint16(localView, 12, 0)
    writeUint32(localView, 14, crc)
    writeUint32(localView, 18, dataBytes.length)
    writeUint32(localView, 22, dataBytes.length)
    writeUint16(localView, 26, fileNameBytes.length)
    writeUint16(localView, 28, 0)
    localHeader.set(fileNameBytes, 30)

    localChunks.push(localHeader, dataBytes)

    const centralHeader = new Uint8Array(46 + fileNameBytes.length)
    const centralView = new DataView(centralHeader.buffer)

    writeUint32(centralView, 0, 0x02014b50)
    writeUint16(centralView, 4, 20)
    writeUint16(centralView, 6, 20)
    writeUint16(centralView, 8, 0)
    writeUint16(centralView, 10, 0)
    writeUint16(centralView, 12, 0)
    writeUint16(centralView, 14, 0)
    writeUint32(centralView, 16, crc)
    writeUint32(centralView, 20, dataBytes.length)
    writeUint32(centralView, 24, dataBytes.length)
    writeUint16(centralView, 28, fileNameBytes.length)
    writeUint16(centralView, 30, 0)
    writeUint16(centralView, 32, 0)
    writeUint16(centralView, 34, 0)
    writeUint16(centralView, 36, 0)
    writeUint32(centralView, 38, 0)
    writeUint32(centralView, 42, offset)
    centralHeader.set(fileNameBytes, 46)

    centralChunks.push(centralHeader)
    offset += localHeader.length + dataBytes.length
  }

  const centralDirectory = concatArrays(centralChunks)
  const localData = concatArrays(localChunks)
  const endRecord = new Uint8Array(22)
  const endView = new DataView(endRecord.buffer)

  writeUint32(endView, 0, 0x06054b50)
  writeUint16(endView, 4, 0)
  writeUint16(endView, 6, 0)
  writeUint16(endView, 8, files.length)
  writeUint16(endView, 10, files.length)
  writeUint32(endView, 12, centralDirectory.length)
  writeUint32(endView, 16, localData.length)
  writeUint16(endView, 20, 0)

  return new Blob([localData, centralDirectory, endRecord], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}

function buildSheetXml(rows) {
  const headers = ['Customer', 'Contact', 'Instagram', 'Items', 'Total', 'Status', 'Notes', 'Order Summary', 'Created At']
  const data = [
    headers,
    ...rows.map((row) => [
      row.customer,
      row.contact,
      row.instagram,
      String(row.totalItems),
      row.totalPrice,
      row.status,
      row.notes,
      row.orderSummary,
      row.createdAt,
    ]),
  ]

  const xmlRows = data
    .map(
      (cells, rowIndex) =>
        `<row r="${rowIndex + 1}">${cells
          .map(
            (cell, columnIndex) =>
              `<c r="${String.fromCharCode(65 + columnIndex)}${rowIndex + 1}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell)}</t></is></c>`,
          )
          .join('')}</row>`,
    )
    .join('')

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${xmlRows}</sheetData>
</worksheet>`
}

export function exportPurchaseRequestsXlsx(requests) {
  const rows = buildRows(requests)
  const files = [
    {
      name: '[Content_Types].xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
    },
    {
      name: '_rels/.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/workbook.xml',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Contacts" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`,
    },
    {
      name: 'xl/_rels/workbook.xml.rels',
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
    },
    {
      name: 'xl/worksheets/sheet1.xml',
      content: buildSheetXml(rows),
    },
  ]

  triggerDownload(createZip(files), 'contacts-export.xlsx')
}
