// src/presentation/features/files/buttons/UploadButton.tsx
import React, { useState } from 'react'
import { Upload } from 'lucide-react'
import { UploadModal } from './Uploadmodal'
import type { Documento } from '../../../../../domain/files/Filesapi'

interface UploadButtonProps {
  /** Callback con el documento subido */
  onUploaded?: (doc: Documento) => void
  className?: string
}

export function UploadButton({ onUploaded, className = '' }: UploadButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Subir archivo"
        className={[
          'inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm',
          'bg-[#AEEBF2] text-[#223740] hover:bg-[#9adde5]',
          'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5A878C]',
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