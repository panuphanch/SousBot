import { LogEntry } from '../../utils/logger';

declare global {
  namespace Express {
    interface Request {
      logContext?: LogEntry['context'];
    }
  }
}