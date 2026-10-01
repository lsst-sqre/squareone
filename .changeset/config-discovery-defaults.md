---
'squareone': minor
---

The `siteName`, `environmentName`, and `baseUrl` configuration keys are now optional, so they no longer need to be set for each Phalanx environment. When a key is omitted, Squareone resolves it at request time:

- `siteName` defaults to the environment title from Repertoire service discovery (`environment.title`), then to `Rubin Science Platform`.
- `environmentName` defaults to the Phalanx environment label from discovery (`environment.label`), then to `unknown`.
- `baseUrl` defaults to the Squareone UI service URL from discovery (`services.ui.squareone.url`, without the trailing slash), then to the request origin derived from the `X-Forwarded-Proto`, `X-Forwarded-Host`, and `Host` headers.

Explicitly configured values always take precedence. Discovery is fetched only when `repertoireUrl` is set and a key is omitted, and an unavailable Repertoire API is logged rather than failing the page. The resolved values are used for page titles, the injected Sentry configuration, the `/admin/sentry` configuration summary, and absolute URLs such as notification permalinks.

The `coManageRegistryUrl` configuration key is deprecated. The app does not read it; the COmanage registry URL is available from service discovery as `services.ui.comanage`. The key is still accepted so existing configurations continue to validate.
