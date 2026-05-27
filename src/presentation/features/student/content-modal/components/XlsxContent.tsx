import { useState, useEffect } from 'react'
import { read, utils } from 'xlsx'
import { Download, Loader2 } from 'lucide-react'
import type { XlsxContentData } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

interface XlsxContentProps {
  data: XlsxContentData
  onComplete: () => void
}

type Row = (string | number | boolean | null)[]

export function XlsxContent({ data, onComplete }: XlsxContentProps) {
  const [rows,    setRows]    = useState<Row[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(false)
  const filename = data.filename ?? 'archivo.xlsx'

  useEffect(() => {
    const controller = new AbortController()
    const load = async () => {
      try {
        const res  = await fetch(data.url, { signal: controller.signal })
        const blob = await res.blob()
        const binaryStr = await new Promise<string>((resolve, reject) => {
          const fr = new FileReader()
          fr.onload  = () => resolve(fr.result as string)
          fr.onerror = reject
          fr.readAsBinaryString(blob)
        })
        const wb   = read(binaryStr, { type: 'binary' })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const json = utils.sheet_to_json<Row>(ws, { header: 1, defval: '' })
        if (json.length > 0) {
          setHeaders((json[0] as string[]).map(String))
          setRows(json.slice(1) as Row[])
        }
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setError(true)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    load()
    return () => controller.abort()
  }, [data.url])

  return (
    <div className="space-y-4">

      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-secondary" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center gap-2 py-10 text-secondary text-sm">
          <p>No se pudo cargar el archivo.</p>
          <a href={data.url} download={filename}
             className="underline text-primary font-medium">
            Descargar manualmente
          </a>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-auto rounded-xl border border-mid/20 max-h-[55vh]">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="sticky top-0 bg-primary text-tertiary">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-2.5 font-semibold whitespace-nowrap border-r border-white/10 last:border-r-0">
                    {h || `Col ${i + 1}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-surface' : 'bg-surface-muted'}>
                  {headers.map((_, ci) => (
                    <td key={ci} className="px-4 py-2 text-primary border-r border-mid/10 last:border-r-0 whitespace-nowrap">
                      {row[ci] != null ? String(row[ci]) : ''}
                    </td>
                  ))}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={headers.length} className="px-4 py-8 text-center text-secondary">
                    Sin datos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <a
        href={data.url}
        download={filename}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                   border border-mid/30 text-sm font-medium text-primary
                   hover:bg-primary/5 transition-colors"
      >
        <Download size={16} />
        Descargar {filename}
      </a>

      <button
        onClick={onComplete}
        className="w-full py-3 rounded-xl text-sm font-medium border border-mid/30 text-primary hover:bg-primary/5 transition-colors"
      >
        He revisado este archivo
      </button>
    </div>
  )
}
