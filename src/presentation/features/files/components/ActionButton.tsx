// src/presentation/features/files/components/ActionButton.tsx

import React from 'react'

import {
  IconPDF,
  IconDOC,
  IconXLSX,
  IconImage,
} from '../../../../ui/icons/fileIcons'

import type { FileType } from '../../../../domain/files/types'

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// VARIANT CLASSES
// ─────────────────────────────────────────────────────────────
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    `
    bg-[#183847]
    text-white
    hover:bg-[#20495d]
    shadow-sm
    `,

  secondary:
    `
    bg-[#7AA6B6]
    text-white
    hover:bg-[#6a95a4]
    shadow-sm
    `,

  tertiary:
    `
    bg-[#BEEAF2]
    text-[#183847]
    hover:bg-[#a7dbe6]
    shadow-sm
    `,

  danger:
    `
    bg-[#F04438]
    text-white
    hover:bg-[#d92d20]
    shadow-sm
    `,

  ghost:
    `
    bg-white
    border
    border-[#D0D5DD]
    text-[#344054]
    hover:bg-[#F9FAFB]
    `,
}

// ─────────────────────────────────────────────────────────────
// SIZE CLASSES
// ─────────────────────────────────────────────────────────────
const SIZE_CLASSES: Record<ButtonSize, string> = {
  xs:
    `
    text-[11px]
    px-2.5
    py-1
    rounded-lg
    `,

  sm:
    `
    text-xs
    px-3
    py-1.5
    rounded-xl
    `,

  md:
    `
    text-[13px]
    px-4
    py-2
    rounded-xl
    `,

  lg:
    `
    text-sm
    px-5
    py-3
    rounded-2xl
    `,
}

// ─────────────────────────────────────────────────────────────
// MAIN BUTTON
// ─────────────────────────────────────────────────────────────
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
        `
        inline-flex
        items-center
        justify-center
        gap-2

        font-semibold

        transition-all
        duration-200

        active:scale-95

        disabled:opacity-50
        disabled:cursor-not-allowed

        whitespace-nowrap
        `,

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

// ─────────────────────────────────────────────────────────────
// ICON BUTTON
// ─────────────────────────────────────────────────────────────
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
    default:
      `
      bg-white
      border
      border-[#D0D5DD]
      text-[#344054]
      hover:bg-[#F2F4F7]
      `,

    danger:
      `
      bg-[#F04438]
      border
      border-[#F04438]
      text-white
      hover:bg-[#d92d20]
      `,

    dark:
      `
      bg-white/10
      border
      border-white/20
      text-white
      hover:bg-white/20
      `,
  }[variant]

  return (
    <button
      title={title}
      onClick={onClick}
      className={[
        `
        w-10
        h-10

        rounded-xl

        flex
        items-center
        justify-center

        transition-all
        duration-150

        active:scale-95
        `,

        variantClass,

        className,
      ].join(' ')}
    >
      {icon}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// FILE ICON MAP
// ─────────────────────────────────────────────────────────────
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