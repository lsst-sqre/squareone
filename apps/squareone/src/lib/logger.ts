import pino from 'pino';
import { getAppVersion } from './version';

const isProduction = process.env.NODE_ENV === 'production';

let rootLogger: pino.Logger;

if (isProduction) {
  rootLogger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
} else {
  // Use synchronous pino-pretty stream instead of worker-thread transport
  // to avoid "worker has exited" errors during Next.js HMR
  // eslint-disable-next-line
  const pinoPretty = require('pino-pretty');
  rootLogger = pino({ level: process.env.LOG_LEVEL ?? 'debug' }, pinoPretty());
}

// Bind the build's version + revision so every record — and every child
// logger — is attributable to a specific build, while preserving pino's
// default pid/hostname base fields. See src/lib/version.ts for the single
// source of truth.
const { version, revision } = getAppVersion();
const logger = rootLogger.child({ version, revision });

export default logger;

/**
 * Create a child logger scoped to an API route.
 */
export function createRouteLogger(routeName: string) {
  return logger.child({ route: routeName });
}
