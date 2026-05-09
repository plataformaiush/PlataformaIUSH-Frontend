import React from 'react'

import { IconButton } from '../ActionButton'

import {
  IconDownload,
} from '../../../../../ui/icons/fileIcons'

interface DownloadIconButtonProps {
  onClick?: () => void
  className?: string
}

export function DownloadIconButton({
  onClick,
  className, 
}: DownloadIconButtonProps) {
  return (
    <IconButton
      icon={<IconDownload />}
      title="Descargar"
      onClick={onClick}
      className={className}
    />
  )
}