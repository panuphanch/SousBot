import * as dotenv from 'dotenv';
import { logInfo } from '../utils/logger';

if (process.env.NODE_ENV === 'production') {
  logInfo('Using production environment');
  dotenv.config({ path: '.env.production' });
} else {
  logInfo('Using development environment');
  dotenv.config(); // Loads .env as fallback
  dotenv.config({ path: '.env.local', override: true });
}