import React from 'react'
import { ActionButton } from '../ActionButton'

const UploadIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 21V9" />
    <path d="M7 14l5-5 5 5" />
    <path d="M5 3h14" />
  </svg>
)

export function UploadButton({
  onClick,
  className,
}: {
  onClick?: () => void
  className?: string
}) {
  return (
    <ActionButton
      variant="tertiary"
      icon={<UploadIcon />}
      onClick={onClick}
      className={className}
    >
      Subir archivo
    </ActionButton>
  )
}