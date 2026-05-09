import React from 'react'
import { ActionButton } from '../ActionButton'

const PreviewIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

export function PreviewButton({
  onClick,
  className,
}: {
  onClick?: () => void
  className?: string
}) {
  return (
    <ActionButton
      variant="secondary"
      icon={<PreviewIcon />}
      onClick={onClick}
      className={className}
    >
      Vista previa
    </ActionButton>
  )
}