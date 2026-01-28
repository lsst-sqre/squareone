import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
  ...(!isProduction && {
    transport: {
      target: 'pino-pretty',
    },
  }),
});

export default logger;

/**
 * Create a child logger scoped to an API route.
 */
export function createRouteLogger(routeName: string) {
  return logger.child({ route: routeName });
}
