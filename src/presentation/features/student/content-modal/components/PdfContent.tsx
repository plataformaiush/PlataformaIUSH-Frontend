import { useState } from 'react'
import { FileText, Download, ExternalLink } from 'lucide-react'
import type { PdfContentData } from '../../../../../../../PlataformaIUSH-Frontend/src/domain/shared/interfaces/ICourseContent'

interface PdfContentProps {
  data: PdfContentData
  onComplete: () => void
}

export function PdfContent({ data, onComplete }: PdfContentProps) {
  const [loadError, setLoadError] = useState(false)
  const filename = data.filename ?? 'documento.pdf'

  return (
    <div className="space-y-4">
      {!loadError ? (
        <div className="w-full rounded-xl overflow-hidden border border-mid/20 h-[60vh]">
          <iframe
            src={data.url}
            className="w-full h-full"
            title={data.title}
            onError={() => setLoadError(true)}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 py-10 rounded-xl border border-mid/20">
          <FileText size={40} className="text-secondary opacity-60" />
          <p className="text-sm text-secondary">No se pudo previsualizar el PDF</p>
          <a
            href={data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-tertiary text-sm font-medium"
          >
            <ExternalLink size={16} />
            Abrir en nueva pestaña
          </a>
        </div>
      )}

      <a
        href={data.url}
        download={filename}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-mid/30 text-sm font-medium text-primary"
      >
        <Download size={16} />
        Descargar {filename}
      </a>

      <button
        onClick={onComplete}
        className="w-full py-3 rounded-xl text-sm font-medium bg-primary text-tertiary"
      >
        He revisado este documento
      </button>
    </div>
  )
}
