export type ExcelValue = string | number | boolean | null | undefined

export interface ExcelExport {
  filename: string
  sheetName: string
  headers: string[]
  rows: ExcelValue[][]
}

const xml = (value: string) => value
  .replace(/./gsu, (character) => {
    const code = character.codePointAt(0)!
    return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 0xd7ff) || (code >= 0xe000 && code <= 0xfffd) || code >= 0x10000 ? character : ''
  })
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

function columnName(index: number): string {
  let name = ''
  for (let value = index + 1; value > 0; value = Math.floor((value - 1) / 26)) name = String.fromCharCode(65 + (value - 1) % 26) + name
  return name
}

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let crc = index
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0)
  return crc >>> 0
})

// XLSX is a ZIP archive of XML files. Store entries without compression so exports
// work entirely in the browser, without a spreadsheet library or a server.
function zip(files: Record<string, string>) {
  const encoder = new TextEncoder()
  const entries = Object.entries(files).map(([name, content]) => ({ name: encoder.encode(name), content: encoder.encode(content) }))
  const size = entries.reduce((total, entry) => total + 30 + 46 + entry.name.length * 2 + entry.content.length, 22)
  const bytes = new Uint8Array(size)
  const view = new DataView(bytes.buffer)
  let offset = 0
  const uint16 = (value: number) => { view.setUint16(offset, value, true); offset += 2 }
  const uint32 = (value: number) => { view.setUint32(offset, value, true); offset += 4 }
  const append = (value: Uint8Array) => { bytes.set(value, offset); offset += value.length }
  const directory: { name: Uint8Array; length: number; checksum: number; start: number }[] = []

  for (const entry of entries) {
    let crc = 0xffffffff
    for (const byte of entry.content) crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff]
    const checksum = (crc ^ 0xffffffff) >>> 0
    const start = offset
    uint32(0x04034b50); uint16(20); uint16(0x0800); uint16(0)
    uint16(0); uint16(33); uint32(checksum)
    uint32(entry.content.length); uint32(entry.content.length); uint16(entry.name.length); uint16(0)
    append(entry.name); append(entry.content)
    directory.push({ name: entry.name, length: entry.content.length, checksum, start })
  }
  const directoryStart = offset
  for (const entry of directory) {
    uint32(0x02014b50); uint16(20); uint16(20); uint16(0x0800); uint16(0)
    uint16(0); uint16(33); uint32(entry.checksum); uint32(entry.length); uint32(entry.length)
    uint16(entry.name.length); uint16(0); uint16(0); uint16(0); uint16(0); uint32(0); uint32(entry.start)
    append(entry.name)
  }
  const directorySize = offset - directoryStart
  uint32(0x06054b50); uint16(0); uint16(0); uint16(entries.length); uint16(entries.length)
  uint32(directorySize); uint32(directoryStart); uint16(0)
  return bytes
}

export function createExcelFile({ sheetName, headers, rows }: ExcelExport) {
  if (!headers.length || headers.length > 16384 || rows.length > 1048575) throw new Error('The grid exceeds Excel worksheet limits.')
  const namespace = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
  const relationshipNamespace = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
  const declaration = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
  const lastCell = `${columnName(headers.length - 1)}${rows.length + 1}`
  const columns = headers.map((header, index) => {
    const width = rows.reduce((current, row) => Math.min(55, Math.max(current, String(row[index] ?? '').length + 2)), Math.min(55, Math.max(16, header.length + 2)))
    return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`
  }).join('')
  const sheetRows = [headers, ...rows].map((row, rowIndex) => `<row r="${rowIndex + 1}">${headers.map((_, columnIndex) => {
    const value = row[columnIndex]
    const reference = `${columnName(columnIndex)}${rowIndex + 1}`
    const style = rowIndex === 0 ? ' s="1"' : ''
    if (typeof value === 'number' && Number.isFinite(value)) return `<c r="${reference}"${style}><v>${value}</v></c>`
    if (typeof value === 'boolean') return `<c r="${reference}" t="b"${style}><v>${value ? 1 : 0}</v></c>`
    // Inline strings preserve leading zeroes and never execute text as formulas.
    return `<c r="${reference}" t="inlineStr"${style}><is><t xml:space="preserve">${xml(String(value ?? ''))}</t></is></c>`
  }).join('')}</row>`).join('')
  const safeSheetName = sheetName.replace(/[\\/*?:[\]]/g, ' ').replace(/^'+|'+$/g, '').slice(0, 31) || 'Export'
  return zip({
    '[Content_Types].xml': `${declaration}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
    '_rels/.rels': `${declaration}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${relationshipNamespace}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    'xl/workbook.xml': `${declaration}<workbook xmlns="${namespace}" xmlns:r="${relationshipNamespace}"><sheets><sheet name="${xml(safeSheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
    'xl/_rels/workbook.xml.rels': `${declaration}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${relationshipNamespace}/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="${relationshipNamespace}/styles" Target="styles.xml"/></Relationships>`,
    'xl/styles.xml': `${declaration}<styleSheet xmlns="${namespace}"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF217346"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`,
    'xl/worksheets/sheet1.xml': `${declaration}<worksheet xmlns="${namespace}"><dimension ref="A1:${lastCell}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${columns}</cols><sheetData>${sheetRows}</sheetData><autoFilter ref="A1:${lastCell}"/></worksheet>`,
  })
}

export async function downloadExcel(options: ExcelExport) {
  const bytes = await createExcelFile(options)
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${options.filename}.xlsx`
  document.body.appendChild(link)
  try {
    link.click()
  } finally {
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
