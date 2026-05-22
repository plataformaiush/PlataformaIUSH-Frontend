export enum ContentType {
  VIDEO    = 'video',
  TEXT     = 'text',
  IMAGE    = 'image',
  DOCUMENT = 'document',
  QUIZ_TF  = 'quiz_tf',
  QUIZ_MC  = 'quiz_mc',
}

export type ContentStatus = 'active' | 'draft'

export interface Content {
  id: string
  moduleId: string
  title: string
  description: string
  type: ContentType
  status: ContentStatus
  resourceUrl?: string
  durationMinutes?: number
  order: number
}

export interface QuizTFData {
  questionType: 'quiz_tf'
  question: string
  correctAnswer: boolean
  explanation?: string
}

export interface QuizMCOption {
  id: string
  text: string
}

export interface QuizMCData {
  questionType: 'quiz_mc'
  question: string
  options: QuizMCOption[]
  correctAnswerId: string
  explanation?: string
}

export type QuizData = QuizTFData | QuizMCData

export function parseQuizData(raw: string): QuizData | null {
  try {
    const parsed = JSON.parse(raw)
    if (parsed.questionType === 'quiz_tf' || parsed.questionType === 'quiz_mc') {
      return parsed as QuizData
    }
    return null
  } catch {
    return null
  }
}
