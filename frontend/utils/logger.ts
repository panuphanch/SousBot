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

  private logToServer(entry: LogEntry) {
    if (this.isVercelProduction) {
      this.logToVercel(entry);
      return;
    }

    const formattedMetadata = entry.metadata ? 
      `\n  Metadata: ${JSON.stringify(entry.metadata, null, 2)}` : '';
    
    console[entry.level](
      `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${formattedMetadata}`
    );
  }

  private logToClient(entry: LogEntry) {
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

  public log(level: LogLevel, message: string, metadata?: LogMetadata) {
    const entry = this.formatLogEntry(level, message, metadata);
    
    if (this.isServer) {
      this.logToServer(entry);
    } else {
      this.logToClient(entry);
    }
  }

  public info(message: string, metadata?: LogMetadata) {
    this.log('info', message, metadata);
  }

  public warn(message: string, metadata?: LogMetadata) {
    this.log('warn', message, metadata);
  }

  public error(message: string, metadata?: LogMetadata) {
    this.log('error', message, metadata);
  }
}

export const logger = Logger.getInstance();

// Utility functions for easier use
export const logError = (error: Error | string, metadata?: LogMetadata) => {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorMetadata = error instanceof Error 
    ? { 
        ...metadata, 
        stack: error.stack,
        // Add useful debugging information
        path: typeof window !== 'undefined' ? window.location.pathname : 'server',
        timestamp: new Date().toISOString()
      }
    : metadata;
  
  logger.error(errorMessage, errorMetadata);
};

export const logInfo = (message: string, metadata?: LogMetadata) => {
  logger.info(message, metadata);
};

export const logWarning = (message: string, metadata?: LogMetadata) => {
  logger.warn(message, metadata);
};

export default logger;