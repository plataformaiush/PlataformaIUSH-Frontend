export enum ContentType {
  VIDEO = 'video',
  TEXT = 'text',
  IMAGE = 'image',
  DOCUMENT = 'document'
}

export type ContentStatus = 'active' | 'draft'

export interface Content {
  id: string
  moduleId: string
  title: string
  description: string
  type: ContentType
  status: ContentStatus
  resourceUrl?: string      // URL del recurso o archivo asociado
  durationMinutes?: number  // Duración opcional para video/audio
  order: number
}