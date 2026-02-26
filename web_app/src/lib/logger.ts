// Centralized logging utility
// Replace console.log/error with this logger for production-ready logging

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatLog(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
    };
  }

  private sendToService(entry: LogEntry) {
    // In production, send to logging service (Sentry, LogRocket, etc.)
    // For now, we'll just use console in production too
    if (!this.isDevelopment) {
      // TODO: Implement production logging service
      // Example: Sentry.captureMessage(entry.message, entry.level);
    }
  }

  info(message: string, data?: unknown) {
    const entry = this.formatLog('info', message, data);
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data || '');
    }
    this.sendToService(entry);
  }

  warn(message: string, data?: unknown) {
    const entry = this.formatLog('warn', message, data);
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '');
    }
    this.sendToService(entry);
  }

  error(message: string, error?: unknown) {
    const entry = this.formatLog('error', message, error);
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, error || '');
    } else {
      console.error(`[ERROR] ${message}`);
    }
    this.sendToService(entry);
  }

  debug(message: string, data?: unknown) {
    if (this.isDevelopment) {
      const entry = this.formatLog('debug', message, data);
      console.debug(`[DEBUG] ${message}`, data || '');
      this.sendToService(entry);
    }
  }
}

export const logger = new Logger();

// Helper function for API error handling
export const handleApiError = (error: unknown, context: string): string => {
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  logger.error(`${context}: ${message}`, error);
  return message;
};
