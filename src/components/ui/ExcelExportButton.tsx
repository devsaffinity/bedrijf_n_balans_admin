import { FileSpreadsheet, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { downloadExcel } from '../../utils/excelExport'
import type { ExcelExport } from '../../utils/excelExport'

export function ExcelExportButton(options: ExcelExport) {
  const [exporting, setExporting] = useState(false)
  const label = `Export ${options.sheetName.toLowerCase()} to Excel`
  const exportGrid = async () => {
    setExporting(true)
    try {
      await downloadExcel(options)
    } catch {
      toast.error('Unable to export to Excel. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return <button type="button" className="inline-flex size-11 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-40" title={options.rows.length ? `${label} (all filtered rows)` : 'No rows to export'} aria-label={label} aria-busy={exporting} disabled={exporting || !options.rows.length} onClick={exportGrid}>
    {exporting ? <LoaderCircle size={23} className="animate-spin" aria-hidden="true" /> : <FileSpreadsheet size={25} aria-hidden="true" />}
  </button>
}
