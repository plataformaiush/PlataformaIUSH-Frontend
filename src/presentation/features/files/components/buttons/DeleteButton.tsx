import React from 'react'
import { ActionButton } from '../ActionButton'
import {
  IconDelete,
  IconDownload,
} from '../../../../../ui/icons/fileIcons'


interface DeleteButtonProps {
  onClick?: () => void
  className?: string
}

export function DeleteButton({
    onClick,
    className,
  }: DeleteButtonProps) {
    return (
      <ActionButton
        variant="danger"
        icon={<IconDelete />}
        onClick={onClick}
        className={className}
      >
        Eliminar
      </ActionButton>
    )
}