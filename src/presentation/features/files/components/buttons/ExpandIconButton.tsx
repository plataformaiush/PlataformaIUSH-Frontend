import React from 'react'
import { IconButton } from '../ActionButton'

const ExpandIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M15 3h6v6" />
    <path d="M9 21H3v-6" />
    <path d="M21 3l-7 7" />
    <path d="M3 21l7-7" />
  </svg>
)

interface ExpandIconButtonProps {
  onClick?: () => void,
  className?: string
}

export function ExpandIconButton({
  onClick,
  className,
}: ExpandIconButtonProps) {
  return (
    <IconButton
      icon={<ExpandIcon />}
      title="Expandir"
      onClick={onClick}
      className={className}
    />
  )
}