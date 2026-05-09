import type { FileItem, FileType } from './types'

export interface Content {
  id: string
  name: string
  file?: FileItem
  url?: string
}

export type ContentType = FileType | 'url'

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  pdf: 'PDF',
  doc: 'Documento',
  xlsx: 'Hoja de cálculo',
  image: 'Imagen',
  url: 'Enlace externo',
}

export const PREVIEWABLE_FILE_TYPES: FileType[] = [
  'pdf',
  'xlsx',
  'image'
]

export const FILE_TYPES: FileType[] = [
  'pdf',
  'doc',
  'xlsx',
  'image'
]