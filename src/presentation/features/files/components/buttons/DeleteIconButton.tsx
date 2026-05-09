import React from 'react'
import {
  IconDelete,
} from '../../../../../ui/icons/fileIcons'
import { IconButton } from '../ActionButton'

interface DeleteIconButtonProps {
  onClick?: () => void
  className?: string
}

export function DeleteIconButton({
  onClick,
  className,
}: DeleteIconButtonProps) {
  return (
    <IconButton
      icon={<IconDelete />}
      title="Eliminar"
      variant="danger"
      onClick={onClick}
      className={className}
    />
  )
}