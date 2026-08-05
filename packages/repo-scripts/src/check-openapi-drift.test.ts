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

// A spec shaped like the Semaphore false-drift case: a schema property whose
// `examples` value is serialized upstream from an unordered Python collection,
// so its element order varies from one process/pod to the next.
function specWithIdsExamples(examples: unknown) {
  return {
    openapi: '3.1.0',
    info: {
      title: 'Semaphore',
      version: '2.0.0',
    },
    components: {
      schemas: {
        UserNotificationRead: {
          type: 'object',
          properties: {
            ids: { type: 'array', examples },
          },
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

  it('returns "ok" when only the order of an examples array differs', () => {
    const committed = specWithIdsExamples(['58', '57', '56', '59']);
    const live = specWithIdsExamples(['58', '56', '57', '59']);

    expect(classifySpecs(committed, live)).toBe('ok');
  });

  it('returns "ok" when an array nested inside examples is reordered', () => {
    // The literal Semaphore shape: the single example *is* the id list.
    const committed = specWithIdsExamples([['58', '57', '56', '59']]);
    const live = specWithIdsExamples([['58', '56', '57', '59']]);

    expect(classifySpecs(committed, live)).toBe('ok');
  });

  it('returns "version-only" when examples order and info.version differ', () => {
    const committed = specWithIdsExamples([['58', '57', '56', '59']]);
    const live = specWithIdsExamples([['58', '56', '57', '59']]);
    live.info.version = '2.0.1';

    expect(classifySpecs(committed, live)).toBe('version-only');
  });

  it('returns "drift" when examples membership changes', () => {
    const committed = specWithIdsExamples([['58', '57', '56', '59']]);
    const live = specWithIdsExamples([['58', '57', '56', '60']]);

    expect(classifySpecs(committed, live)).toBe('drift');
  });

  it('returns "drift" when a non-examples array is reordered', () => {
    const committed = specWithIdsExamples(['58']);
    const live = specWithIdsExamples(['58']);
    // `enum` order is not normalized — only `examples` gets the exception.
    (
      committed.components.schemas.UserNotificationRead.properties
        .ids as Record<string, unknown>
    ).enum = ['a', 'b'];
    (
      live.components.schemas.UserNotificationRead.properties.ids as Record<
        string,
        unknown
      >
    ).enum = ['b', 'a'];

    expect(classifySpecs(committed, live)).toBe('drift');
  });

  it('returns "drift" when an examples array of objects is reordered', () => {
    const committed = specWithIdsExamples([{ a: 1 }, { b: 2 }]);
    const live = specWithIdsExamples([{ b: 2 }, { a: 1 }]);

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
