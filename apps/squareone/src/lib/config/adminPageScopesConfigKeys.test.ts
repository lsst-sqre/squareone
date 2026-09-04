import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Ajv from 'ajv';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';

import { ADMIN_PAGE_IDS, DEFAULT_ADMIN_PAGE_SCOPES } from './adminPageScopes';

// Resolve the app-root config files relative to this test (src/lib/config/).
const appRoot = join(__dirname, '../../../');

const schema = JSON.parse(
  readFileSync(join(appRoot, 'squareone.config.schema.json'), 'utf8')
);
const devConfig = load(
  readFileSync(join(appRoot, 'squareone.config.yaml'), 'utf8')
) as Record<string, unknown>;

/** Mirrors loader.ts's Ajv setup so these tests exercise the real pipeline. */
function validateConfig(data: Record<string, unknown>) {
  const ajv = new Ajv({ useDefaults: true, removeAdditional: true });
  const validate = ajv.compile(schema);
  const isValid = validate(data);
  return { isValid, errors: validate.errors, data };
}

describe('adminPageScopes config key', () => {
  it('declares adminPageScopes in the schema with title and description', () => {
    expect(schema.properties.adminPageScopes).toMatchObject({
      type: 'object',
    });
    expect(schema.properties.adminPageScopes.title).toEqual(expect.any(String));
    expect(schema.properties.adminPageScopes.description).toEqual(
      expect.any(String)
    );
  });

  it('restricts the keys to the page ids fixed in code', () => {
    expect(schema.properties.adminPageScopes.propertyNames.enum).toEqual([
      ...ADMIN_PAGE_IDS,
    ]);
  });

  it('declares the same per-page defaults as the adminPageScopes module', () => {
    for (const pageId of ADMIN_PAGE_IDS) {
      expect(
        schema.properties.adminPageScopes.properties[pageId]
      ).toMatchObject({
        type: 'array',
        items: { type: 'string' },
        default: DEFAULT_ADMIN_PAGE_SCOPES[pageId],
      });
    }
  });

  it('applies the documented defaults via Ajv when the key is absent', () => {
    // Existing Phalanx deployments omit the key entirely; they must keep
    // working with the built-in scope mapping.
    const { isValid, data } = validateConfig({});

    expect(isValid).toBe(true);
    expect(data.adminPageScopes).toEqual(DEFAULT_ADMIN_PAGE_SCOPES);
  });

  it('fills the unnamed pages when only some are configured', () => {
    const { isValid, data } = validateConfig({
      adminPageScopes: { sentry: ['exec:admin', 'admin:observability'] },
    });

    expect(isValid).toBe(true);
    expect(data.adminPageScopes).toEqual({
      ...DEFAULT_ADMIN_PAGE_SCOPES,
      sentry: ['exec:admin', 'admin:observability'],
    });
  });

  it('rejects an unknown page id rather than silently dropping it', () => {
    const { isValid, errors } = validateConfig({
      adminPageScopes: { notARealPage: ['exec:admin'] },
    });

    expect(isValid).toBe(false);
    expect(errors).not.toBeNull();
  });

  it('rejects a non-string scope entry', () => {
    const { isValid } = validateConfig({
      adminPageScopes: { sentry: [42] },
    });

    expect(isValid).toBe(false);
  });

  it('sets the development mapping in squareone.config.yaml', () => {
    expect(devConfig.adminPageScopes).toEqual(DEFAULT_ADMIN_PAGE_SCOPES);
  });
});
