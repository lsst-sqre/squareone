import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';

// Resolve the app-root config files relative to this test (src/lib/config/).
const appRoot = join(__dirname, '../../../');

const schema = JSON.parse(
  readFileSync(join(appRoot, 'squareone.config.schema.json'), 'utf8')
);
const devConfig = load(
  readFileSync(join(appRoot, 'squareone.config.yaml'), 'utf8')
) as Record<string, unknown>;

describe('sentryOrg / sentryProject config keys', () => {
  it('declares sentryOrg in the schema with the documented default', () => {
    expect(schema.properties.sentryOrg).toMatchObject({
      type: 'string',
      default: 'rubin-observatory',
    });
  });

  it('declares sentryProject in the schema with the documented default', () => {
    expect(schema.properties.sentryProject).toMatchObject({
      type: 'string',
      default: 'squareone',
    });
  });

  it('sets the keys in the development squareone.config.yaml', () => {
    expect(devConfig.sentryOrg).toBe('rubin-observatory');
    expect(devConfig.sentryProject).toBe('squareone');
  });
});
