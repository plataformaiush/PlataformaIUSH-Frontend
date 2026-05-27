import { useState } from 'react'
import { Download } from 'lucide-react'
import { filesApi } from '../../../../../domain/files/Filesapi'

interface DownloadButtonProps {
  id: string
  fileName?: string
  className?: string
}

// Extrae el nombre legible del archivo a partir del id (ruta relativa).
// "documentos/1747123456789_mi_archivo.pdf" → "mi_archivo.pdf"
// Si el nombre tiene prefijo timestamp (números_), lo elimina.
function extractFileName(id: string, fallback?: string): string {
  if (fallback) return fallback
  const segment = id.split('/').pop() || id          // último segmento de la ruta
  return segment.replace(/^\d+_/, '')                // quita el prefijo "timestamp_"
}

export function DownloadButton({ id, fileName, className = '' }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const url = filesApi.descargarUrl(id)
      const name = extractFileName(id, fileName)

      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error('fetch failed')
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = name
        document.body.appendChild(link)
        link.click()
        link.remove()
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
      } catch {
        // Fallback: abrir en pestaña nueva si CORS bloquea el fetch
        window.open(url, '_blank')
      }
    } catch (err) {
      console.error('Download error:', err)
      alert('No se pudo descargar el archivo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      aria-label="Descargar archivo"
      className={[
        'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm',
        '[background-color:var(--color-primary)] text-white hover:opacity-85',
        'transition-all duration-200 focus:outline-none focus:ring-2 [--tw-ring-color:var(--color-secondary)]',
        loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      <Download size={15} />
      {loading ? 'Descargando…' : 'Descargar'}
    </button>
  )
}