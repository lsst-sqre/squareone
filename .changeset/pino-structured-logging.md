---
'squareone': minor
---

Add pino structured logging for server-side code

- Replaced `console.*` calls in server-side code with pino structured JSON logging
- Production outputs GKE-compatible JSON to stdout; development uses pino-pretty for readable output
- Log level configurable via `LOG_LEVEL` environment variable (defaults to `info` in production, `debug` in development)
- Config loading and MDX loading messages moved to `debug` level to reduce production noise
- API route handlers use child loggers with route context for easier tracing
- Client-side components remain unchanged (Sentry handles client error reporting)
