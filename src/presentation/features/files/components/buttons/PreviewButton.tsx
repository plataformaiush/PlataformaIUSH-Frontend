import React, { useState } from 'react'
import { Maximize2, Play } from 'lucide-react'
import { FilePreviewContainer } from '../vistas/Filepreviewcontainer'

type PreviewButtonProps = {
  label?: string
  /** 'expand' muestra ícono de ampliar, 'play' muestra ícono de reproducir */
  variant?: 'expand' | 'play'
  className?: string
} & (
  | { id: string; url?: never }
  | { url: string; id?: never }
)

export function PreviewButton({
  id,
  url,
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
          'border [border-color:var(--color-border)] bg-white [color:var(--color-primary)]',
          'hover:[border-color:var(--color-secondary)] hover:[color:var(--color-secondary)]',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 [--tw-ring-color:var(--color-tertiary)]',
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
        id
          ? <FilePreviewContainer id={id} onClose={() => setOpen(false)} />
          : <FilePreviewContainer url={url!} onClose={() => setOpen(false)} />
      )}
    </>
  )
}