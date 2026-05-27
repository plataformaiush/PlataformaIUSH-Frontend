import { useState, useCallback, useEffect } from 'react'
import { useCourseListStore } from '../stores/courseListStore'

// Error types for better error handling
export interface AppError {
  id: string
  message: string
  type: 'network' | 'validation' | 'permission' | 'server' | 'user_cancelled' | 'unknown'
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
  action?: {
    label: string
    handler: () => void
  }
  dismissible?: boolean
  autoDismiss?: number // in milliseconds
}

// Reactive error handling hook
export const useReactiveErrorHandling = () => {
  const { error, setError } = useCourseListStore()
  const [errors, setErrors] = useState<AppError[]>([])
  const [errorHistory, setErrorHistory] = useState<AppError[]>([])

  // Convert string error to AppError
  const normalizeError = useCallback((error: string | Error | AppError): AppError => {
    if (typeof error === 'string') {
      return {
        id: Date.now().toString(),
        message: error,
        type: 'unknown',
        severity: 'medium',
        timestamp: new Date(),
        dismissible: true,
        autoDismiss: 5000
      }
    }

    if (error instanceof Error) {
      const message = error.message
      
      // Determine error type and severity based on message content
      let type: AppError['type'] = 'unknown'
      let severity: AppError['severity'] = 'medium'

      if (message.includes('Network') || message.includes('fetch')) {
        type = 'network'
        severity = 'high'
      } else if (message.includes('permission') || message.includes('unauthorized')) {
        type = 'permission'
        severity = 'high'
      } else if (message.includes('validation') || message.includes('required')) {
        type = 'validation'
        severity = 'medium'
      } else if (message.includes('server') || message.includes('500')) {
        type = 'server'
        severity = 'critical'
      } else if (message.includes('cancelled') || message.includes('User cancelled')) {
        type = 'user_cancelled'
        severity = 'low'
      }

      return {
        id: Date.now().toString(),
        message,
        type,
        severity,
        timestamp: new Date(),
        dismissible: true,
        autoDismiss: type === 'user_cancelled' ? 2000 : 5000
      }
    }

    return error
  }, [])

  // Add error to the queue
  const addError = useCallback((error: string | Error | AppError) => {
    const normalizedError = normalizeError(error)
    
    setErrors(prev => [...prev, normalizedError])
    setError(normalizedError.message)
    
    // Add to history
    setErrorHistory(prev => [normalizedError, ...prev].slice(0, 50))

    // Auto dismiss if specified
    if (normalizedError.autoDismiss && normalizedError.autoDismiss > 0) {
      setTimeout(() => {
        dismissError(normalizedError.id)
      }, normalizedError.autoDismiss)
    }

    return normalizedError.id
  }, [normalizeError, setError])

  // Dismiss specific error
  const dismissError = useCallback((errorId: string) => {
    setErrors(prev => prev.filter(e => e.id !== errorId))
    
    // Clear global error if this was the last error
    setErrors(prev => {
      if (prev.length === 0) {
        setError(null)
      }
      return prev
    })
  }, [setError])

  // Dismiss all errors
  const dismissAllErrors = useCallback(() => {
    setErrors([])
    setError(null)
  }, [setError])

  // Retry action for failed operations
  const retryAction = useCallback((errorId: string, retryFn: () => Promise<void>) => {
    dismissError(errorId)
    retryFn().catch(error => addError(error))
  }, [dismissError, addError])

  // Handle async operations with error catching
  const withErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    customErrorMessage?: string
  ): Promise<T | null> => {
    try {
      return await operation()
    } catch (error) {
      const errorMessage = customErrorMessage || (error instanceof Error ? error.message : 'An error occurred')
      addError(errorMessage)
      return null
    }
  }, [addError])

  // Get error statistics
  const getErrorStats = useCallback(() => {
    const stats = {
      total: errorHistory.length,
      byType: {} as Record<AppError['type'], number>,
      bySeverity: {} as Record<AppError['severity'], number>,
      recent: errorHistory.filter(e => 
        new Date().getTime() - e.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
      ).length
    }

    errorHistory.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
    })

    return stats
  }, [errorHistory])

  return {
    // Current errors
    errors,
    globalError: error,
    
    // Actions
    addError,
    dismissError,
    dismissAllErrors,
    retryAction,
    withErrorHandling,
    
    // Analytics
    getErrorStats,
    errorHistory,
    
    // Utilities
    hasErrors: errors.length > 0,
    hasCriticalErrors: errors.some(e => e.severity === 'critical')
  }
}

// Reactive success notifications
export const useReactiveNotifications = () => {
  const [notifications, setNotifications] = useState<AppError[]>([])

  const addNotification = useCallback((
    message: string,
    type: 'success' | 'info' | 'warning' = 'success',
    autoDismiss: number = 3000
  ) => {
    const notification: AppError = {
      id: Date.now().toString(),
      message,
      type: type === 'success' ? 'unknown' : type as AppError['type'],
      severity: 'low',
      timestamp: new Date(),
      dismissible: true,
      autoDismiss
    }

    setNotifications(prev => [...prev, notification])

    if (autoDismiss > 0) {
      setTimeout(() => {
        dismissNotification(notification.id)
      }, autoDismiss)
    }

    return notification.id
  }, [])

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  const dismissAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    dismissNotification,
    dismissAllNotifications,
    hasNotifications: notifications.length > 0
  }
}

// Combined reactive feedback system
export const useReactiveFeedback = () => {
  const errorHandling = useReactiveErrorHandling()
  const notifications = useReactiveNotifications()

  const showSuccess = useCallback((message: string) => {
    return notifications.addNotification(message, 'success')
  }, [notifications])

  const showInfo = useCallback((message: string) => {
    return notifications.addNotification(message, 'info')
  }, [notifications])

  const showWarning = useCallback((message: string) => {
    return notifications.addNotification(message, 'warning')
  }, [notifications])

  const showError = useCallback((error: string | Error) => {
    return errorHandling.addError(error)
  }, [errorHandling])

  const clearAll = useCallback(() => {
    errorHandling.dismissAllErrors()
    notifications.dismissAllNotifications()
  }, [errorHandling, notifications])

  return {
    ...errorHandling,
    ...notifications,
    showSuccess,
    showInfo,
    showWarning,
    showError,
    clearAll,
    hasFeedback: errorHandling.hasErrors || notifications.hasNotifications
  }
}
