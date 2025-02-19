type LogLevel = 'info' | 'warn' | 'error';
type LogMetadata = Record<string, any>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
}

class Logger {
  private static instance: Logger;
  private isServer: boolean;
  private isVercelProduction: boolean;
  private debugApiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/debug-log`;

  private constructor() {
    this.isServer = typeof window === 'undefined';
    this.isVercelProduction = process.env.VERCEL_ENV === 'production';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLogEntry(level: LogLevel, message: string, metadata?: LogMetadata): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata
    };
  }

  private async sendToDebugApi(entry: LogEntry) {
    try {
      const payload = {
        message: entry.message,
        metadata: {
          ...entry.metadata,
          level: entry.level,
          timestamp: entry.timestamp
        },
        context: {
          path: typeof window !== 'undefined' ? window.location.pathname : 'server',
          userId: entry.metadata?.lineUserId || 'unknown'
        }
      };

      const response = await fetch(this.debugApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Failed to send log to debug API:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending log to debug API:', error);
    }
  }

  private logToVercel(entry: LogEntry) {
    // Vercel uses console.log for their logging system
    const logObject = {
      level: entry.level,
      message: entry.message,
      ...entry.metadata,
      timestamp: entry.timestamp
    };

    // Vercel automatically captures console.log in production
    if (entry.level === 'error') {
      // For errors, include full details
      console.error(JSON.stringify(logObject));
    } else {
      // For other levels, use regular logging
      console.log(JSON.stringify(logObject));
    }
  }

  private async logToServer(entry: LogEntry) {
    if (this.isVercelProduction) {
      await this.sendToDebugApi(entry);
    }

    const formattedMetadata = entry.metadata ? 
      `\n  Metadata: ${JSON.stringify(entry.metadata, null, 2)}` : '';
    
    console[entry.level](
      `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${formattedMetadata}`
    );
  }

  private async logToClient(entry: LogEntry) {
    if (this.isVercelProduction || process.env.NEXT_PUBLIC_ENABLE_DEBUG_API === 'true') {
      await this.sendToDebugApi(entry);
    }
    
    // For development, use console with colors
    const styles = {
      info: 'color: #00f',
      warn: 'color: #f90',
      error: 'color: #f00'
    };

    console[entry.level](
      `%c[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}`,
      styles[entry.level],
      entry.metadata || ''
    );
  }

  public async log(level: LogLevel, message: string, metadata?: LogMetadata) {
    const entry = this.formatLogEntry(level, message, metadata);
    
    if (this.isServer) {
      await this.logToServer(entry);
    } else {
      await this.logToClient(entry);
    }
  }

  public async info(message: string, metadata?: LogMetadata) {
    await this.log('info', message, metadata);
  }

  public async warn(message: string, metadata?: LogMetadata) {
    await this.log('warn', message, metadata);
  }

  public async error(message: string, metadata?: LogMetadata) {
    await this.log('error', message, metadata);
  }
}

export const logger = Logger.getInstance();

// Utility functions for easier use
export const logError = async (error: Error | string, metadata?: LogMetadata) => {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorMetadata = error instanceof Error 
    ? { 
        ...metadata, 
        stack: error.stack,
        path: typeof window !== 'undefined' ? window.location.pathname : 'server',
        timestamp: new Date().toISOString()
      }
    : metadata;
  
  await logger.error(errorMessage, errorMetadata);
};

export const logInfo = async (message: string, metadata?: LogMetadata) => {
  await logger.info(message, metadata);
};

export const logWarning = async (message: string, metadata?: LogMetadata) => {
  await logger.warn(message, metadata);
};

export default logger;