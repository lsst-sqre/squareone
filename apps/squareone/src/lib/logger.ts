import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

let logger: pino.Logger;

if (isProduction) {
  logger = pino({ level: process.env.LOG_LEVEL ?? 'info' });
} else {
  // Use synchronous pino-pretty stream instead of worker-thread transport
  // to avoid "worker has exited" errors during Next.js HMR
  // eslint-disable-next-line
  const pinoPretty = require('pino-pretty');
  logger = pino({ level: process.env.LOG_LEVEL ?? 'debug' }, pinoPretty());
}

export default logger;

/**
 * Create a child logger scoped to an API route.
 */
export function createRouteLogger(routeName: string) {
  return logger.child({ route: routeName });
}
