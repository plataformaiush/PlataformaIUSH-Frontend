import React from 'react'

import {
  IconPDF,
  IconDOC,
  IconXLSX,
  IconImage,
} from '../../../../ui/icons/fileIcons'

import type { FileType } from '../../../../domain/files/types'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'danger'
  | 'ghost'

export type ButtonSize =
  | 'xs'
  | 'sm'
  | 'md'
  | 'lg'

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'btn-primary',

  secondary: 'btn-secondary',

  tertiary: 'btn-tertiary',

  danger: 'btn-danger',

  ghost: 'btn-ghost',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'btn-xs',

  sm: 'btn-sm',

  md: 'btn-md',

  lg: 'btn-lg',
}

interface ActionButtonProps {
  variant?: ButtonVariant

  size?: ButtonSize

  icon?: React.ReactNode

  children: React.ReactNode

  onClick?: () => void

  className?: string

  disabled?: boolean
}

export function ActionButton({
  variant = 'primary',

  size = 'md',

  icon,

  children,

  onClick,

  className = '',

  disabled = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        'btn-base',

        VARIANT_CLASSES[variant],

        SIZE_CLASSES[size],

        className,
      ].join(' ')}
    >
      {icon}

      {children}
    </button>
  )
}

interface IconButtonProps {
  icon: React.ReactNode

  title: string

  onClick?: () => void

  className?: string

  variant?: 'default' | 'danger' | 'dark'
}

export function IconButton({
  icon,

  title,

  onClick,

  className = '',

  variant = 'default',
}: IconButtonProps) {

  const variantClass = {
    default: 'icon-btn-default',

    danger: 'icon-btn-danger',

    dark: 'icon-btn-dark',
  }[variant]

  return (
    <button
      title={title}
      onClick={onClick}
      className={[
        'icon-btn-base',

        variantClass,

        className,
      ].join(' ')}
    >
      {icon}
    </button>
  )
}

export const fileIconMap: Record<
  FileType,
  React.FC<{ size?: number; color?: string }>
> = {
  pdf: IconPDF,

  doc: IconDOC,

  xlsx: IconXLSX,

  image: IconImage,
}

// ─────────────────────────────────────────────────────────────
// GET FILE ICON
// ─────────────────────────────────────────────────────────────
export function getFileIcon(type: FileType) {
  const Icon = fileIconMap[type]

  return <Icon size={18} />
}