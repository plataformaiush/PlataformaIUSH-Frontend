// src/presentation/features/files/buttons/DownloadButton.tsx
import React, { useState } from 'react'
import { Download } from 'lucide-react'
import { filesApi } from '../../../../../domain/files/Filesapi'

interface DownloadButtonProps {
  id: string
  /** Nombre sugerido del archivo descargado */
  nombreArchivo?: string
  className?: string
}

export function DownloadButton({
  id,
  nombreArchivo,
  className = '',
}: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    try {
      setLoading(true)
      const url = filesApi.descargarUrl(id)
      const link = document.createElement('a')
      link.href = url
      link.download = nombreArchivo || `documento_${id}`
      // Adjunta token para que el navegador lo envíe si el servidor lo admite
      // (alternativamente usa fetch + blob para rutas protegidas)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Error descargando:', err)
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
        'bg-[#223740] text-white hover:bg-[#1a2c35]',
        'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5A878C]',
        loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      <Download size={15} />
      {loading ? 'Descargando…' : 'Descargar archivo'}
    </button>
  )
}