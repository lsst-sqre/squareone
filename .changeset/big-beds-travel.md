---
'squareone': minor
---

Added Sentry instrumentation to the `squareone` app.

Both the NextJS client (frontend) and server (backend) code are instrumented with the official [Sentry NextJS integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/).
The Sentry DSN should be provided in a `SENTRY_DSN` environment variable.
If a Sentry DSN is not provided, there will be no changes to app behaviour.
If a Sentry DSN is provided, then these things will be sent to Sentry:
* Any uncaught exceptions and error-level logs
* Traces for user interaction (according to the sample settings)
* Session replays for user interaction (according to the sample settings)

There are new config file options for Sentry configuration:
* `sentryTracesSampleRate`
* `sentryReplaysSessionSampleRate`
* `sentryReplaysOnErrorSampleRate`
* `sentryDebug`

There is a new route, `/sentry-example-page` which provides a way to quickly check that the Sentry integration is working.
