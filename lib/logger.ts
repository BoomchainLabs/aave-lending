type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

class Logger {
  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, error } = entry;
    let log = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    if (context && Object.keys(context).length > 0) {
      log += ` ${JSON.stringify(context)}`;
    }

    if (error) {
      log += `\nError: ${error.message}\nStack: ${error.stack}`;
    }

    return log;
  }

  info(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context,
    };
    console.log('[v0]', this.formatLog(entry));
  }

  warn(message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context,
    };
    console.warn('[v0]', this.formatLog(entry));
  }

  error(message: string, error?: Error, context?: Record<string, any>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context,
      error,
    };
    console.error('[v0]', this.formatLog(entry));
  }

  debug(message: string, context?: Record<string, any>) {
    if (process.env.DEBUG === 'true') {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'debug',
        message,
        context,
      };
      console.debug('[v0]', this.formatLog(entry));
    }
  }
}

export const logger = new Logger();
