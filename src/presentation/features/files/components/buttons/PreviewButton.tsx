// src/presentation/features/files/components/buttons/PreviewButton.tsx
import React, { useState } from 'react'
import { Maximize2, Play } from 'lucide-react'
import { FilePreviewContainer } from '../vistas/Filepreviewcontainer'

interface PreviewButtonProps {
  id: string
  /** Texto del botón. Default: 'Ver' */
  label?: string
  /** 'expand' muestra ícono de ampliar, 'play' muestra ícono de reproducir */
  variant?: 'expand' | 'play'
  className?: string
}

export function PreviewButton({
  id,
  label = 'Ver',
  variant = 'expand',
  className = '',
}: PreviewButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={label}
        className={[
          'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium',
          'border border-gray-200 bg-white text-[#223740]',
          'hover:border-[#5A878C] hover:text-[#5A878C] transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-[#AEEBF2]',
          className,
        ].join(' ')}
      >
        {variant === 'play'
          ? <Play size={14} className="fill-current" />
          : <Maximize2 size={14} />
        }
        {label}
      </button>

      {open && (
        <FilePreviewContainer id={id} onClose={() => setOpen(false)} />
      )}
    </>
  )
}