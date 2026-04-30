// Contenido multimedia - Requisito del correo

export interface Content {
  id: string
  title: string
  description: string
  type: ContentType  // Videos, Textos, Archivos
  url?: string
  data?: string
  metadata: ContentMetadata
  moduleId: string
  courseId: string
  order: number
}

export type ContentType = 
  | 'video'      // Videos
  | 'text'       // Textos
  | 'pdf'        // Archivos PDF
  | 'doc'        // Archivos docs
  | 'xlsx'       // Archivos xlsx
  | 'image'      // Imágenes
  | 'audio'      // Audio
  | 'link'       // Enlaces externos

export interface ContentMetadata {
  duration?: number     // Duración en segundos (videos/audio)
  size?: number         // Tamaño en bytes (archivos)
  thumbnail?: string    // Miniatura
  uploadedAt: Date
  uploadedBy: string
  tags: string[]
  isDownloadable: boolean
}

export interface VideoContent extends Content {
  type: 'video'
  url: string
  metadata: ContentMetadata & {
    duration: number
    resolution?: string
    format: 'mp4' | 'webm' | 'avi'
  }
}

export interface TextContent extends Content {
  type: 'text'
  data: string
  metadata: ContentMetadata & {
    wordCount?: number
    readingTime?: number
  }
}

export interface FileContent extends Content {
  type: 'pdf' | 'doc' | 'xlsx'
  url: string
  metadata: ContentMetadata & {
    size: number
    format: string
    isPreviewable: boolean
  }
}

// Ejemplo de uso
export const createVideoContent = (
  title: string,
  url: string,
  duration: number
): VideoContent => ({
  id: crypto.randomUUID(),
  title,
  description: '',
  type: 'video',
  url,
  moduleId: '',
  courseId: '',
  order: 0,
  metadata: {
    duration,
    uploadedAt: new Date(),
    uploadedBy: '',
    tags: [],
    isDownloadable: false,
    resolution: '1080p',
    format: 'mp4'
  }
})
