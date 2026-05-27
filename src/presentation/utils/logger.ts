/**
 * Sistema de logging estructurado para reemplazar console statements
 * En producción, esto podría conectarse a un servicio de logging externo
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
}

class Logger {
  private isDevelopment = import.meta.env.DEV

  private formatLog(entry: LogEntry): string {
    const { level, message, context, timestamp } = entry
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ''
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>) {
    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString()
    }

    const formatted = this.formatLog(entry)

    if (this.isDevelopment) {
      switch (level) {
        case 'error':
          console.error(formatted)
          break
        case 'warn':
          console.warn(formatted)
          break
        case 'debug':
          console.debug(formatted)
          break
        default:
          console.log(formatted)
      }
    } else {
      // En producción, enviar a servicio de logging externo
      // Por ahora, solo errores se loguean en producción
      if (level === 'error') {
        console.error(formatted)
      }
    }
  }

  info(message: string, context?: Record<string, unknown>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, unknown>) {
    this.log('warn', message, context)
  }

  error(message: string, context?: Record<string, unknown>) {
    this.log('error', message, context)
  }

  debug(message: string, context?: Record<string, unknown>) {
    this.log('debug', message, context)
  }
}

export const logger = new Logger()
