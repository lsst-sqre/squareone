// Canonical list of Gafaelfawr scopes the mocked dev environment knows about.
//
// This drives two things:
//   1. The `config.scopes` field of the mocked `GET /auth/api/v1/login`
//      response (see `app/api/dev/login-info/route.dev.ts`), which feeds
//      `useLoginInfo()` and the admin UI's available-scope list.
//   2. The scope checklist in the `/dev` auth control panel.
//
// It is colocated with the rest of the dev tooling so it never reaches the
// production build. The descriptions mirror the shared mock in
// `@lsst-sqre/gafaelfawr-client` (`mockLoginInfo.config.scopes`).

import type { Scope } from '@lsst-sqre/gafaelfawr-client';

/** Scopes selectable in the dev panel and advertised by the login-info mock. */
export const AVAILABLE_SCOPES: Scope[] = [
  { name: 'exec:admin', description: 'Administer the Science Platform' },
  { name: 'admin:token', description: 'Administer user tokens' },
  { name: 'admin:notifications', description: 'Send user notifications' },
  { name: 'read:tap', description: 'Query TAP services' },
  { name: 'exec:notebook', description: 'Run notebooks in Nublado' },
  { name: 'read:image', description: 'Read images from the archive' },
  { name: 'exec:portal', description: 'Use the Firefly portal' },
];
