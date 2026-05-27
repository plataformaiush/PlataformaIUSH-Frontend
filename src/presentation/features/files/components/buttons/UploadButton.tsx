import { useState } from 'react'
import { Upload } from 'lucide-react'
import { UploadModal } from './Uploadmodal'
import type { Documento } from '../../../../../domain/files/Filesapi'

interface UploadButtonProps {
  onUploaded?: (doc: Documento) => void
  className?: string
}

export function UploadButton({ onUploaded, className = '' }: UploadButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Subir archivo"
        className={[
          'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm',
          '[background-color:var(--color-tertiary)] [color:var(--color-primary)] hover:opacity-85',
          'transition-all duration-200 focus:outline-none focus:ring-2 [--tw-ring-color:var(--color-secondary)]',
          className,
        ].join(' ')}
      >
        <Upload size={15} />
        Subir archivo
      </button>

      <UploadModal
        open={open}
        onClose={() => setOpen(false)}
        onUploaded={(doc) => {
          setOpen(false)
          onUploaded?.(doc)
        }}
      />
    </>
  )
}