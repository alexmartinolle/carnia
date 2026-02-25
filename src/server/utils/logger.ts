type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: string,
    data?: LogContext
  ): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` [${context}]` : ''
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : ''
    
    return `[${timestamp}] [${level.toUpperCase()}]${contextStr} ${message}${dataStr}`
  }

  debug(message: string, context?: string, data?: LogContext) {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message, context, data))
    }
  }

  info(message: string, context?: string, data?: LogContext) {
    console.info(this.formatMessage('info', message, context, data))
  }

  warn(message: string, context?: string, data?: LogContext) {
    console.warn(this.formatMessage('warn', message, context, data))
  }

  error(message: string, context?: string, error?: unknown) {
    const errorData =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error

    console.error(this.formatMessage('error', message, context, errorData as LogContext))
  }
}

export const logger = new Logger()