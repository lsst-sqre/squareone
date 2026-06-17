import { describe, expect, it } from 'vitest';

import { classifySpecs, comparableJson } from './check-openapi-drift.js';

// A minimal but representative OpenAPI spec used as the baseline for the
// comparison tests. Each case clones and mutates this to model a real scenario.
function baseSpec() {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Times Square',
      version: '0.23.1.dev24+g576ef1393',
    },
    paths: {
      '/v1/pages': {
        get: {
          summary: 'List pages',
          responses: { '200': { description: 'OK' } },
        },
      },
    },
    components: {
      schemas: {
        Page: {
          type: 'object',
          properties: { name: { type: 'string' } },
        },
      },
    },
  };
}

describe('classifySpecs', () => {
  it('returns "ok" for identical specs', () => {
    expect(classifySpecs(baseSpec(), baseSpec())).toBe('ok');
  });

  it('returns "version-only" when only info.version differs', () => {
    const committed = baseSpec();
    const live = baseSpec();
    // Model a setuptools-scm dev-version bump from a server redeploy.
    live.info.version = '0.23.1.dev30+gabcdef123';

    expect(classifySpecs(committed, live)).toBe('version-only');
  });

  it('returns "drift" when a path changes', () => {
    const committed = baseSpec();
    const live = baseSpec();
    (live.paths as Record<string, unknown>)['/v1/pages/{id}'] = {
      get: { summary: 'Get page', responses: { '200': { description: 'OK' } } },
    };

    expect(classifySpecs(committed, live)).toBe('drift');
  });

  it('returns "drift" when a schema changes', () => {
    const committed = baseSpec();
    const live = baseSpec();
    live.components.schemas.Page.properties = {
      name: { type: 'string' },
      title: { type: 'string' },
    };

    expect(classifySpecs(committed, live)).toBe('drift');
  });

  it('returns "drift" when info.title changes but info.version is equal', () => {
    const committed = baseSpec();
    const live = baseSpec();
    // Only info.version is excluded from comparison, not all of info.
    live.info.title = 'Times Square (renamed)';

    expect(classifySpecs(committed, live)).toBe('drift');
  });
});

describe('comparableJson', () => {
  it('is independent of info.version', () => {
    const a = baseSpec();
    const b = baseSpec();
    b.info.version = 'something-completely-different';

    expect(comparableJson(a)).toBe(comparableJson(b));
  });

  it('is independent of object key ordering', () => {
    const ordered = {
      openapi: '3.1.0',
      info: { title: 'X', version: '1.0.0' },
      paths: {},
    };
    const reordered = {
      paths: {},
      info: { version: '1.0.0', title: 'X' },
      openapi: '3.1.0',
    };

    expect(comparableJson(ordered)).toBe(comparableJson(reordered));
  });

  it('reflects a real API change', () => {
    const committed = baseSpec();
    const live = baseSpec();
    live.components.schemas.Page.properties = {
      name: { type: 'string' },
      published: { type: 'boolean' },
    };

    expect(comparableJson(committed)).not.toBe(comparableJson(live));
  });
});
