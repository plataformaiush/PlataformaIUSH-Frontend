import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { courseKeys } from './useCoursesQuery'
import { useReactiveFeedback } from './useReactiveErrorHandling'
import type { Course } from '../domain/courses/types'

// Real-time event types
export interface RealTimeEvent {
  type: 'course_created' | 'course_updated' | 'course_deleted' | 'course_status_changed' | 'module_updated' | 'student_enrolled'
  data: any
  timestamp: Date
  userId?: string
}

// WebSocket connection hook
export const useWebSocketConnection = (url: string) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<RealTimeEvent | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxReconnectAttempts = 5
  const reconnectAttempts = useRef(0)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setConnectionStatus('connecting')
    setIsConnected(false)

    try {
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnectionStatus('connected')
        setIsConnected(true)
        reconnectAttempts.current = 0
        console.log('WebSocket connected')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const realTimeEvent: RealTimeEvent = {
            ...data,
            timestamp: new Date(data.timestamp)
          }
          setLastMessage(realTimeEvent)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        setConnectionStatus('disconnected')
        setIsConnected(false)
        console.log('WebSocket disconnected:', event.code, event.reason)

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          reconnectAttempts.current++
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.current}/${maxReconnectAttempts})...`)
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        setConnectionStatus('error')
        console.error('WebSocket error:', error)
      }

    } catch (error) {
      setConnectionStatus('error')
      console.error('Failed to create WebSocket connection:', error)
    }
  }, [url])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected')
      wsRef.current = null
    }

    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  }
}

// EventSource connection for Server-Sent Events
export const useEventSourceConnection = (url: string) => {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealTimeEvent | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const eventSourceRef = useRef<EventSource | null>(null)

  const connect = useCallback(() => {
    if (eventSourceRef.current) return

    setConnectionStatus('connecting')
    setIsConnected(false)

    try {
      const eventSource = new EventSource(url)
      eventSourceRef.current = eventSource

      eventSource.onopen = () => {
        setConnectionStatus('connected')
        setIsConnected(true)
        console.log('EventSource connected')
      }

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const realTimeEvent: RealTimeEvent = {
            ...data,
            timestamp: new Date(data.timestamp)
          }
          setLastEvent(realTimeEvent)
        } catch (error) {
          console.error('Error parsing EventSource message:', error)
        }
      }

      eventSource.onerror = (error) => {
        setConnectionStatus('error')
        setIsConnected(false)
        console.error('EventSource error:', error)
        
        // EventSource automatically reconnects, but we'll close it on error
        eventSource.close()
        eventSourceRef.current = null
      }

    } catch (error) {
      setConnectionStatus('error')
      console.error('Failed to create EventSource connection:', error)
    }
  }, [url])

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }, [])

  useEffect(() => {
    connect()
    return disconnect
  }, [connect, disconnect])

  return {
    isConnected,
    connectionStatus,
    lastEvent,
    connect,
    disconnect
  }
}

// Real-time course updates hook
export const useRealTimeCourseUpdates = (websocketUrl?: string, eventSourceUrl?: string) => {
  const queryClient = useQueryClient()
  const { showSuccess, showInfo, showError } = useReactiveFeedback()
  const [updateHistory, setUpdateHistory] = useState<RealTimeEvent[]>([])

  // Use WebSocket if URL provided, otherwise fallback to polling
  const { lastMessage, isConnected, connectionStatus } = websocketUrl
    ? useWebSocketConnection(websocketUrl)
    : { lastMessage: null, isConnected: false, connectionStatus: 'disconnected' as const }

  // Handle real-time events
  useEffect(() => {
    if (!lastMessage) return

    const event = lastMessage
    setUpdateHistory(prev => [event, ...prev].slice(0, 100)) // Keep last 100 events

    switch (event.type) {
      case 'course_created':
        handleCourseCreated(event.data)
        showInfo('Nuevo curso creado')
        break

      case 'course_updated':
        handleCourseUpdated(event.data)
        showSuccess('Curso actualizado')
        break

      case 'course_deleted':
        handleCourseDeleted(event.data)
        showInfo('Curso eliminado')
        break

      case 'course_status_changed':
        handleCourseStatusChanged(event.data)
        showSuccess('Estado del curso actualizado')
        break

      case 'module_updated':
        handleModuleUpdated(event.data)
        showInfo('Módulo actualizado')
        break

      case 'student_enrolled':
        handleStudentEnrolled(event.data)
        showInfo('Nuevo estudiante inscrito')
        break

      default:
        console.log('Unknown event type:', event.type)
    }
  }, [lastMessage, showSuccess, showInfo])

  const handleCourseCreated = useCallback((courseData: Course) => {
    // Add new course to all queries
    queryClient.setQueriesData({ queryKey: courseKeys.lists() }, (old: any) => {
      if (!old) return old
      
      if (Array.isArray(old)) {
        // For infinite query pages
        return old.map((page: Course[], index: number) => 
          index === 0 ? [courseData, ...page] : page
        )
      } else {
        // For single query
        return [courseData, ...old]
      }
    })

    // Invalidate to trigger refetch
    queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
  }, [queryClient])

  const handleCourseUpdated = useCallback((courseData: Partial<Course> & { id: string }) => {
    // Update course in all queries
    queryClient.setQueriesData({ queryKey: courseKeys.lists() }, (old: any) => {
      if (!old) return old
      
      if (Array.isArray(old)) {
        return old.map((page: Course[]) => 
          page.map(course => 
            course.id === courseData.id 
              ? { ...course, ...courseData }
              : course
          )
        )
      } else {
        return old.map((course: Course) => 
          course.id === courseData.id 
            ? { ...course, ...courseData }
            : course
        )
      }
    })
  }, [queryClient])

  const handleCourseDeleted = useCallback((courseId: string) => {
    // Remove course from all queries
    queryClient.setQueriesData({ queryKey: courseKeys.lists() }, (old: any) => {
      if (!old) return old
      
      if (Array.isArray(old)) {
        return old.map((page: Course[]) => 
          page.filter(course => course.id !== courseId)
        )
      } else {
        return old.filter((course: Course) => course.id !== courseId)
      }
    })

    queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
  }, [queryClient])

  const handleCourseStatusChanged = useCallback((data: { courseId: string; newStatus: string }) => {
    handleCourseUpdated({ id: data.courseId, status: data.newStatus as 'active' | 'inactive' })
  }, [handleCourseUpdated])

  const handleModuleUpdated = useCallback((data: { courseId: string; moduleId: string }) => {
    // Could trigger a refetch of course details or update module count
    queryClient.invalidateQueries({ queryKey: courseKeys.detail(data.courseId) })
  }, [queryClient])

  const handleStudentEnrolled = useCallback((data: { courseId: string; studentCount: number }) => {
    handleCourseUpdated({ id: data.courseId, studentCount: data.studentCount })
  }, [handleCourseUpdated])

  // Fallback polling for when WebSocket is not available
  const startPolling = useCallback((interval: number = 30000) => {
    const pollInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
    }, interval)

    return () => clearInterval(pollInterval)
  }, [queryClient])

  return {
    isConnected,
    connectionStatus,
    updateHistory,
    startPolling,
    clearHistory: () => setUpdateHistory([])
  }
}

// Mock real-time updates for development/demo
export const useMockRealTimeUpdates = () => {
  const [isSimulating, setIsSimulating] = useState(false)
  const queryClient = useQueryClient()
  const { showInfo } = useReactiveFeedback()

  const simulateUpdate = useCallback(() => {
    const updates = [
      { type: 'course_created', data: { id: 'mock-' + Date.now(), title: 'Nuevo Curso Simulado' } },
      { type: 'course_updated', data: { id: '1', title: 'Curso Actualizado' } },
      { type: 'student_enrolled', data: { courseId: '1', studentCount: Math.floor(Math.random() * 100) } }
    ]

    const randomUpdate = updates[Math.floor(Math.random() * updates.length)]
    
    // Simulate the update
    queryClient.invalidateQueries({ queryKey: courseKeys.lists() })
    showInfo('Actualización simulada: ' + randomUpdate.type)
  }, [queryClient, showInfo])

  const startSimulation = useCallback((interval: number = 5000) => {
    setIsSimulating(true)
    const intervalId = setInterval(simulateUpdate, interval)
    
    return () => {
      clearInterval(intervalId)
      setIsSimulating(false)
    }
  }, [simulateUpdate])

  const stopSimulation = useCallback(() => {
    setIsSimulating(false)
  }, [])

  return {
    isSimulating,
    startSimulation,
    stopSimulation,
    simulateUpdate
  }
}
