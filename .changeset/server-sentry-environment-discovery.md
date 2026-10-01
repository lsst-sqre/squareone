---
'squareone': minor
---

Server-side Sentry now uses the same resolved `environmentName` as the browser, so server and browser events carry the same Sentry environment when `environmentName` is omitted from the configuration. The server resolves it once at startup from the configuration, then Repertoire service discovery (`environment.label`), then the `unknown` fallback. The startup discovery fetch waits at most 3 seconds; if Repertoire is unreachable or slow, the server logs a warning and starts with the fallback. The server no longer reads the `SQUAREONE_ENVIRONMENT_NAME` environment variable, and the startup log line now includes the resolved `sentryEnvironment`.
