// Analytics Google Ad Manager - Requisito del correo

import { ITokenManager, MockTokenManager } from '../shared/interfaces/ITokenManager'

export interface AnalyticsEvent {
  event: string
  userId: string
  institutionId: string
  timestamp: Date
  sessionId: string
  metadata: Record<string, any>
  userAgent: string
  url: string
}

export interface UserMetrics {
  userId: string
  institutionId: string
  totalSessions: number
  totalTimeSpent: number
  coursesCompleted: number
  averageSessionDuration: number
  lastActivity: Date
  deviceType: 'mobile' | 'tablet' | 'desktop'
  browser: string
}

export interface CourseMetrics {
  courseId: string
  institutionId: string
  totalEnrollments: number
  completionRate: number
  averageTimeToComplete: number
  dropOffPoints: string[]
  popularContent: ContentMetrics[]
}

export interface ContentMetrics {
  contentId: string
  type: 'video' | 'text' | 'pdf' | 'doc' | 'xlsx'
  views: number
  averageWatchTime?: number
  completionRate: number
  engagementScore: number
}

// Eventos de seguimiento
export type AnalyticsEventType = 
  | 'page_view'
  | 'course_start'
  | 'course_complete'
  | 'content_view'
  | 'content_complete'
  | 'login'
  | 'logout'
  | 'download_file'
  | 'submit_assignment'
  | 'quiz_attempt'
  | 'certificate_earned'

// Servicio de Analytics con inyección de dependencias
export class AnalyticsService {
  private static isInitialized = false
  private static queue: AnalyticsEvent[] = []
  private static tokenManager: ITokenManager = new MockTokenManager()  // Default mock

  // Inyección de dependencias para desacoplar
  static setTokenManager(tokenManager: ITokenManager): void {
    this.tokenManager = tokenManager
  }

  static initialize(googleAdManagerId: string): void {
    // Inicialización de Google Ad Manager
    if (typeof window !== 'undefined' && !this.isInitialized) {
      // Cargar script de Google Ad Manager
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAdManagerId}`
      document.head.appendChild(script)

      // Configurar gtag
      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', googleAdManagerId)

      this.isInitialized = true
      this.processQueue()
    }
  }

  static trackEvent(
    event: AnalyticsEventType,
    userId: string,
    institutionId: string,
    metadata: Record<string, any> = {}
  ): void {
    const analyticsEvent: AnalyticsEvent = {
      event,
      userId,
      institutionId,
      timestamp: new Date(),
      sessionId: this.getSessionId(),
      metadata,
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    if (this.isInitialized) {
      this.sendEvent(analyticsEvent)
    } else {
      this.queue.push(analyticsEvent)
    }
  }

  private static sendEvent(event: AnalyticsEvent): void {
    // Enviar a Google Analytics
    if (window.gtag) {
      window.gtag('event', event.event, {
        user_id: event.userId,
        custom_parameter_1: event.institutionId,
        custom_parameter_2: event.sessionId,
        ...event.metadata
      })
    }

    // También enviar a nuestro backend para análisis personalizados
    this.sendToBackend(event)
  }

  private static async sendToBackend(event: AnalyticsEvent): Promise<void> {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.tokenManager.getAuthHeaders()
        },
        body: JSON.stringify(event)
      })
    } catch (error) {
      console.error('Error sending analytics event:', error)
    }
  }

  private static processQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift()
      if (event) {
        this.sendEvent(event)
      }
    }
  }

  private static getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
  }

  // Métodos específicos para eventos educativos
  static trackCourseStart(courseId: string, userId: string, institutionId: string): void {
    this.trackEvent('course_start', userId, institutionId, { courseId })
  }

  static trackContentComplete(
    contentId: string,
    contentType: string,
    userId: string,
    institutionId: string
  ): void {
    this.trackEvent('content_complete', userId, institutionId, {
      contentId,
      contentType
    })
  }

  static trackQuizAttempt(
    quizId: string,
    score: number,
    userId: string,
    institutionId: string
  ): void {
    this.trackEvent('quiz_attempt', userId, institutionId, {
      quizId,
      score
    })
  }

  static trackCertificateEarned(
    courseId: string,
    userId: string,
    institutionId: string
  ): void {
    this.trackEvent('certificate_earned', userId, institutionId, {
      courseId
    })
  }
}

// Declaración para TypeScript
declare global {
  interface Window {
    dataLayer: any[]
    gtag: (...args: any[]) => void
  }
}
