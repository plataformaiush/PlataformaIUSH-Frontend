export type FileType = 'pdf' | 'doc' | 'xlsx' | 'image'

export interface FileItem {
  idDocContent: string
  idContent: string
  idMasterDocument: string
  name: string
  type: FileType
  size: number
  url: string
}

export interface UploadRequest {
  file: File
  courseId?: string
  moduleId?: string
  contentId?: string
  isPublic: boolean
}

export interface FilePreviewData {
  id: string
  type: FileType
  url: string
  canPreview: boolean
  thumbnailUrl?: string
}

export type UploadState = 'idle' | 'uploading' | 'success' | 'error'

export interface FileUploadProps {
  courseId?: string
  moduleId?: string
  contentId?: string
  onSuccess?: (file?: FileItem) => void
}