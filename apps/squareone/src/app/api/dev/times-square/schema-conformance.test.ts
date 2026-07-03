/**
 * Schema conformance tests for the Times Square dev mock API routes.
 *
 * Each mock route's payload is parsed with the corresponding Zod schema from
 * @lsst-sqre/times-square-client (which mirrors the Times Square OpenAPI spec
 * vendored at packages/times-square-client/openapi.json), so drift between the
 * mocks and the real API fails here instead of as a runtime ZodError in dev.
 */

import {
  GitHubContentsRootSchema,
  GitHubPrContentsSchema,
  HtmlStatusSchema,
  PageSchema,
  PageSummarySchema,
} from '@lsst-sqre/times-square-client';
import { describe, expect, it, vi } from 'vitest';
import { GET as getGithubPage } from './v1/github/[...tsSlug]/route.dev';
import { GET as getGithubContents } from './v1/github/route.dev';
import { GET as getGithubPrPage } from './v1/github-pr/[owner]/[repo]/[commit]/[...tsSlug]/route.dev';
import { GET as getGithubPrContents } from './v1/github-pr/[owner]/[repo]/[commit]/route.dev';
import { GET as getHtmlStatus } from './v1/pages/[page]/htmlstatus/route.dev';
import { GET as getPage } from './v1/pages/[page]/route.dev';
import { GET as getPages } from './v1/pages/route.dev';

vi.mock('@/lib/config/loader', () => ({
  loadAppConfig: vi.fn().mockResolvedValue({
    timesSquareUrl: 'http://localhost:3000/times-square/api',
  }),
}));

vi.mock('@/lib/logger', () => {
  const log = {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  return { default: log, createRouteLogger: () => log };
});

type Parseable = {
  safeParse: (data: unknown) => { success: boolean; error?: unknown };
};

/** Parse a route response with a schema, surfacing Zod issues on failure. */
async function expectConforms(response: Response, schema: Parseable) {
  expect(response.status).toBe(200);
  const payload = await response.json();
  const result = schema.safeParse(payload);
  expect(result.error).toBeUndefined();
}

describe('Times Square dev mock schema conformance', () => {
  it('GET /v1/pages conforms to PageSummary[]', async () => {
    const response = await getPages();
    await expectConforms(response, PageSummarySchema.array());
  });

  it('GET /v1/pages/[page] conforms to PageSchema', async () => {
    const response = await getPage(new Request('http://localhost/mock'), {
      params: Promise.resolve({ page: 'mypage' }),
    });
    await expectConforms(response, PageSchema);
  });

  it('GET /v1/pages/[page]/htmlstatus conforms to HtmlStatusSchema', async () => {
    const response = await getHtmlStatus(
      new Request('http://localhost/mock?a=1'),
      { params: Promise.resolve({ page: 'mypage' }) }
    );
    await expectConforms(response, HtmlStatusSchema);
  });

  it('GET /v1/pages/[page]/htmlstatus (unavailable mode) conforms to HtmlStatusSchema', async () => {
    const response = await getHtmlStatus(
      new Request('http://localhost/mock?a=2'),
      { params: Promise.resolve({ page: 'mypage' }) }
    );
    await expectConforms(response, HtmlStatusSchema);
  });

  it('GET /v1/github conforms to GitHubContentsRootSchema', async () => {
    const response = await getGithubContents();
    await expectConforms(response, GitHubContentsRootSchema);
  });

  it('GET /v1/github/[...tsSlug] conforms to PageSchema', async () => {
    const response = await getGithubPage(new Request('http://localhost/mock'), {
      params: Promise.resolve({
        tsSlug: ['lsst-sqre', 'times-square-demo', 'matplotlib', 'gaussian2d'],
      }),
    });
    await expectConforms(response, PageSchema);
  });

  it('GET /v1/github-pr/[owner]/[repo]/[commit] conforms to GitHubPrContentsSchema', async () => {
    const response = await getGithubPrContents();
    await expectConforms(response, GitHubPrContentsSchema);
  });

  it('GET /v1/github-pr/[owner]/[repo]/[commit]/[...tsSlug] conforms to PageSchema', async () => {
    const response = await getGithubPrPage();
    await expectConforms(response, PageSchema);
  });
});
