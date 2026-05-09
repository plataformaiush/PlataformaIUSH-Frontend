import React from 'react'
import { ActionButton } from '../ActionButton'
import {
  IconDownload,
} from '../../../../../ui/icons/fileIcons'

interface DownloadButtonProps {
  onClick?: () => void
  className?: string
}

export function DownloadButton({
  onClick,
  className,
}: DownloadButtonProps) {
  return (
    <ActionButton
      variant="primary"
      icon={<IconDownload />}
      onClick={onClick}
      className={className}
    >
      Descargar archivo
    </ActionButton>
  )
}