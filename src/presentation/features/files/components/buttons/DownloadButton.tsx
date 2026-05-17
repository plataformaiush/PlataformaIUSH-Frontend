import React, { useState } from 'react'
import { Download } from 'lucide-react'
import { filesApi } from '../../../../../domain/files/Filesapi'

interface DownloadButtonProps {
  id: string
  fileName?: string
  className?: string
}

export function DownloadButton({ id, fileName, className = '' }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      const url = filesApi.descargarUrl(id)
      const name = fileName || `file_${id}`

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
        // Fallback: open in new tab if CORS blocks the fetch
        window.open(url, '_blank')
      }
    } catch (err) {
      console.error('Download error:', err)
      alert('Could not download the file.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      aria-label="Download file"
      className={[
        'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm',
        '[background-color:var(--color-primary)] text-white hover:opacity-85',
        'transition-all duration-200 focus:outline-none focus:ring-2 [--tw-ring-color:var(--color-secondary)]',
        loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      <Download size={15} />
      {loading ? 'Downloading…' : 'Download'}
    </button>
  )
}