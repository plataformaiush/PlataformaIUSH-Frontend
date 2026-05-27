import { useEffect, useState } from 'react'
import { FileText, Download, ExternalLink, Loader } from 'lucide-react'
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

export function PdfContent({ data, onComplete }: PdfContentProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [loading, setLoading] = useState(true)

  const isInternal = isInternalUrl(data.url)
  const filename = data.filename ?? 'documento.pdf'

  useEffect(() => {
    if (!isInternal) {
      setLoading(false)
      return
    }

    let objectUrl: string | null = null

    const fetchPdf = async () => {
      try {
        const headers = tokenManager.getAuthHeaders()
        const res = await fetch(data.url, { headers })

        // Detectar respuesta de error JSON del backend
        const contentType = res.headers.get('content-type') ?? ''
        if (!res.ok || contentType.includes('application/json')) {
          setLoadError(true)
          return
        }

        // Verificar que no sea JSON de error aunque content-type diga otra cosa
        const blob = await res.blob()
        if (blob.type.includes('json') || blob.size < 100) {
          const text = await blob.text()
          try {
            const parsed = JSON.parse(text)
            if (parsed.success === false || parsed.error) {
              setLoadError(true)
              return
            }
          } catch { /* no es JSON, continuar */ }
        }

        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      } catch {
        setLoadError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPdf()
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [data.url, isInternal])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={28} className="animate-spin text-secondary" />
      </div>
    )
  }

  if (loadError) {
    return <NoContentAvailable onClose={onComplete} />
  }

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
        <a
          href={data.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                     border border-mid/30 text-sm font-medium text-primary
                     hover:bg-primary/5 transition-colors"
        >
          <ExternalLink size={16} />
          Abrir en nueva pestaña
        </a>
      )}

      <a
        href={iframeSrc}
        download={filename}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                   border border-mid/30 text-sm font-medium text-primary
                   hover:bg-primary/5 transition-colors"
      >
        <Download size={16} />
        <FileText size={16} />
        Descargar {filename}
      </a>

      <button
        onClick={onComplete}
        className="w-full py-3 rounded-xl text-sm font-medium bg-primary text-tertiary
                   hover:bg-secondary active:scale-95 transition-all"
      >
        He revisado este documento
      </button>
    </div>
  )
}
