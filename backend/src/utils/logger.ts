type LogLevel = 'info' | 'warn' | 'error' | 'debug';
type LogMetadata = Record<string, any>;

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: LogMetadata;
  context?: {
    path?: string;
    method?: string;
    userId?: string;
    requestId?: string;
  };
}

interface DebugLogPayload {
  message: string;
  metadata?: LogMetadata;
  context?: LogEntry['context'];
  source: 'liff' | 'web' | 'backend';
}

class Logger {
  private static instance: Logger;
  private isVercelProduction: boolean;

  private constructor() {
    this.isVercelProduction = process.env.VERCEL_ENV === 'production';
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLogEntry(
    level: LogLevel, 
    message: string, 
    metadata?: LogMetadata,
    context?: LogEntry['context']
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
      context
    };
  }

  private logToVercel(entry: LogEntry) {
    const logObject = {
      level: entry.level,
      message: entry.message,
      ...entry.metadata,
      ...entry.context,
      timestamp: entry.timestamp,
      environment: process.env.NODE_ENV,
      service: 'backend'
    };

    if (entry.level === 'error') {
      console.error(JSON.stringify(logObject));
    } else {
      console.log(JSON.stringify(logObject));
    }
  }

  private logToDevelopment(entry: LogEntry) {
    const contextStr = entry.context 
      ? `\n  Context: ${JSON.stringify(entry.context, null, 2)}` 
      : '';
    
    const metadataStr = entry.metadata 
      ? `\n  Metadata: ${JSON.stringify(entry.metadata, null, 2)}` 
      : '';

    console[entry.level](
      `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}${metadataStr}`
    );
  }

  public log(
    level: LogLevel, 
    message: string, 
    metadata?: LogMetadata,
    context?: LogEntry['context']
  ) {
    const entry = this.formatLogEntry(level, message, metadata, context);
    
    if (this.isVercelProduction) {
      this.logToVercel(entry);
    } else {
      this.logToDevelopment(entry);
    }
  }

  public info(message: string, metadata?: LogMetadata, context?: LogEntry['context']) {
    this.log('info', message, metadata, context);
  }

  public warn(message: string, metadata?: LogMetadata, context?: LogEntry['context']) {
    this.log('warn', message, metadata, context);
  }

  public error(message: string, metadata?: LogMetadata, context?: LogEntry['context']) {
    this.log('error', message, metadata, context);
  }

  public debug(message: string, metadata?: LogMetadata, context?: LogEntry['context']) {
    this.log('debug', message, {
      ...metadata,
      source: 'backend' // Default source
    }, context);
  }
  
  public debugFromLiff(payload: DebugLogPayload) {
    this.log('debug', `[LIFF] ${payload.message}`, {
      ...payload.metadata,
      source: 'liff'
    }, payload.context);
  }
}

export const logger = Logger.getInstance();

// Express middleware to add request context to logs
export const loggerMiddleware = (req: any, res: any, next: () => void) => {
  const requestId = Math.random().toString(36).substring(7);
  req.logContext = {
    path: req.path,
    method: req.method,
    requestId,
    userId: req.user?.id // If you have user authentication
  };
  next();
};

// Utility functions
export const logError = (
  error: Error | string, 
  metadata?: LogMetadata,
  context?: LogEntry['context']
) => {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorMetadata = error instanceof Error 
    ? { 
        ...metadata, 
        stack: error.stack,
        name: error.name
      }
    : metadata;
  
  logger.error(errorMessage, errorMetadata, context);
};

export const logInfo = (
  message: string, 
  metadata?: LogMetadata,
  context?: LogEntry['context']
) => {
  logger.info(message, metadata, context);
};

export const logWarning = (
  message: string, 
  metadata?: LogMetadata,
  context?: LogEntry['context']
) => {
  logger.warn(message, metadata, context);
};

export default logger;