// Builder for the dev mocks' Times Square page metadata.
//
// The Times Square page endpoints (`/v1/pages/:page`, `/v1/github/:path`, and
// the PR-preview variant) all return the same `Page` model, which
// `@lsst-sqre/times-square-client` schema-parses. Building the mock payload in
// one place keeps the three dev routes consistent and schema-valid, so the
// notebook viewer resolves its HTML URLs instead of failing to parse.
//
// It is colocated with the rest of the dev tooling so it never reaches the
// production build.

import type { Page } from '@lsst-sqre/times-square-client';

export type BuildMockPageOptions = {
  /** Page name/slug. */
  name: string;
  /** Times Square base URL (from the app config). */
  timesSquareUrl: string;
  /** GitHub source metadata; `null` for a non-GitHub-backed page. */
  github?: Page['github'];
};

/**
 * Build a schema-valid mock `Page` for the dev Times Square API.
 */
export function buildMockPage({
  name,
  timesSquareUrl,
  github = null,
}: BuildMockPageOptions): Page {
  const pageBaseUrl = `${timesSquareUrl}/v1/pages/${name}`;

  return {
    name,
    title: `Title for ${name}`,
    description: {
      gfm: 'This is the description.',
      html: '<p>This is the description.</p>',
    },
    date_added: '2024-01-15T10:00:00Z',
    authors: [{ name: 'Vera Rubin', username: 'vera' }],
    tags: [],
    uploader_username: 'vera',
    self_url: pageBaseUrl,
    source_url: `${pageBaseUrl}/source`,
    rendered_url: `${pageBaseUrl}/rendered`,
    html_url: `${pageBaseUrl}/html`,
    html_status_url: `${pageBaseUrl}/htmlstatus`,
    html_events_url: `${pageBaseUrl}/htmlevents`,
    parameters: {
      a: {
        type: 'number',
        default: 42,
        description: 'A number.',
      },
      b: {
        type: 'string',
        default: 'Hello',
        description: 'A string.',
      },
    },
    github,
  };
}
