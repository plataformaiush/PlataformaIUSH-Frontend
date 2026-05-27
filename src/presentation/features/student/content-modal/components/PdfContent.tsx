import { useEffect, useState } from 'react'
import { FileText, Download, ExternalLink, Loader, FileSpreadsheet, FileType2 } from 'lucide-react'
import { read, utils } from 'xlsx'
import { tokenManager } from '../../../../services/tokenManager'
import { NoContentAvailable } from './NoContentAvailable'
import type { PdfContentData } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

interface PdfContentProps {
  data: PdfContentData
  onComplete: () => void
}

function isInternalUrl(url: string): boolean {
  return url.includes('localhost') || url.includes('127.0.0.1')
}

type DetectedType = 'pdf' | 'excel' | 'word' | 'unknown'

function detectType(mimeType: string): DetectedType {
  if (mimeType.includes('pdf')) return 'pdf'
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('xlsx') || mimeType.includes('xls')) return 'excel'
  if (mimeType.includes('wordprocessingml') || mimeType.includes('msword') || mimeType.includes('docx')) return 'word'
  return 'unknown'
}

type Row = (string | number | boolean | null)[]

export function PdfContent({ data, onComplete }: PdfContentProps) {
  const [blobUrl, setBlobUrl]       = useState<string | null>(null)
  const [loadError, setLoadError]   = useState(false)
  const [loading, setLoading]       = useState(true)
  const [fileType, setFileType]     = useState<DetectedType>('pdf')
  const [xlsRows, setXlsRows]       = useState<Row[]>([])
  const [xlsHeaders, setXlsHeaders] = useState<string[]>([])

  const isInternal = isInternalUrl(data.url)
  const filename = data.filename ?? 'documento'

  useEffect(() => {
    if (!isInternal) {
      setLoading(false)
      return
    }

    let objectUrl: string | null = null

    const fetchFile = async () => {
      try {
        const headers = tokenManager.getAuthHeaders()
        const res = await fetch(data.url, { headers })

        const contentType = res.headers.get('content-type') ?? ''
        if (!res.ok || contentType.includes('application/json')) {
          setLoadError(true)
          return
        }

        const blob = await res.blob()

        // Detectar JSON de error disfrazado
        if (blob.type.includes('json') || blob.size < 100) {
          const text = await blob.text()
          try {
            const parsed = JSON.parse(text)
            if (parsed.success === false || parsed.error) { setLoadError(true); return }
          } catch { /* no es JSON */ }
        }

        const detected = detectType(blob.type || contentType)
        setFileType(detected)
        objectUrl = URL.createObjectURL(blob)

        if (detected === 'excel') {
          // FileReader.readAsBinaryString es el método recomendado por SheetJS en browsers
          // para evitar mojibake en caracteres UTF-8 (tildes, ñ, etc.)
          const binaryStr = await new Promise<string>((res, rej) => {
            const fr = new FileReader()
            fr.onload  = () => res(fr.result as string)
            fr.onerror = rej
            fr.readAsBinaryString(blob)
          })
          const wb = read(binaryStr, { type: 'binary' })
          const ws  = wb.Sheets[wb.SheetNames[0]]
          const json = utils.sheet_to_json<Row>(ws, { header: 1, defval: '' })
          if (json.length > 0) {
            setXlsHeaders((json[0] as string[]).map(String))
            setXlsRows(json.slice(1) as Row[])
          }
        }

        setBlobUrl(objectUrl)
      } catch {
        setLoadError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchFile()
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [data.url, isInternal])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={28} className="animate-spin text-secondary" />
      </div>
    )
  }

  if (loadError) return <NoContentAvailable onClose={onComplete} />

  const downloadSrc = isInternal ? blobUrl! : data.url

  /* ── Excel: tabla interactiva ── */
  if (fileType === 'excel') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <FileSpreadsheet size={18} className="text-green-600" />
          {filename}
        </div>

        <div className="overflow-auto rounded-xl border border-mid/20 max-h-[55vh]">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="sticky top-0 bg-primary text-tertiary">
              <tr>
                {xlsHeaders.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-semibold whitespace-nowrap border-r border-white/10 last:border-r-0">
                    {h || `Col ${i + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {xlsRows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-surface' : 'bg-mid/5'}>
                  {xlsHeaders.map((_, ci) => (
                    <td key={ci} className="px-4 py-2 text-primary border-r border-mid/10 last:border-r-0 whitespace-nowrap">
                      {row[ci] != null ? String(row[ci]) : ''}
                    </td>
                  ))}
                </tr>
              ))}
              {xlsRows.length === 0 && (
                <tr>
                  <td colSpan={xlsHeaders.length} className="px-4 py-8 text-center text-secondary">
                    Sin datos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <a href={downloadSrc} download={filename}
           className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                      border border-mid/30 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
          <Download size={16} />
          Descargar {filename}
        </a>

        <button onClick={onComplete}
                className="w-full py-3 rounded-xl text-sm font-medium bg-primary text-tertiary hover:bg-secondary active:scale-95 transition-all">
          He revisado este archivo
        </button>
      </div>
    )
  }

  /* ── Word: no previsualizable, solo descarga ── */
  if (fileType === 'word') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <FileType2 size={32} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-primary mb-1">{filename}</p>
            <p className="text-sm text-secondary">
              Los documentos Word no pueden previsualizarse en el navegador.
            </p>
          </div>
        </div>

        <a href={downloadSrc} download={filename}
           className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                      bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors">
          <Download size={16} />
          Descargar documento Word
        </a>

        <button onClick={onComplete}
                className="w-full py-3 rounded-xl text-sm font-medium bg-primary text-tertiary hover:bg-secondary active:scale-95 transition-all">
          He revisado este documento
        </button>
      </div>
    )
  }

  /* ── PDF / desconocido: iframe ── */
  const iframeSrc = isInternal ? blobUrl! : data.url

  return (
    <div className="space-y-4">
      <div className="w-full rounded-xl overflow-hidden border border-mid/20 h-[60vh]">
        <iframe
          src={iframeSrc}
          className="w-full h-full"
          title={data.title}
          onError={() => setLoadError(true)}
        />
      </div>

      {!isInternal && (
        <a href={data.url} target="_blank" rel="noopener noreferrer"
           className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                      border border-mid/30 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
          <ExternalLink size={16} />
          Abrir en nueva pestaña
        </a>
      )}

      <a href={iframeSrc} download={filename}
         className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                    border border-mid/30 text-sm font-medium text-primary hover:bg-primary/5 transition-colors">
        <Download size={16} />
        <FileText size={16} />
        Descargar {filename}
      </a>

      <button onClick={onComplete}
              className="w-full py-3 rounded-xl text-sm font-medium bg-primary text-tertiary hover:bg-secondary active:scale-95 transition-all">
        He revisado este documento
      </button>
    </div>
  )
}
