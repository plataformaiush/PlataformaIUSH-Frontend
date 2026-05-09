import React from 'react'
import { IconButton } from '../ActionButton'

import {
  IconShare,
} from '../../../../../ui/icons/fileIcons'

interface ShareIconButtonProps {
  onClick?: () => void
  className?: string  
}

export function ShareIconButton({
  onClick,
  className,
}: ShareIconButtonProps) {
  return (
    <IconButton
      icon={<IconShare />}
      title="Compartir"
      onClick={onClick}
      className={className}
    />
  )
}