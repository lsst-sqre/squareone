import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Ajv from 'ajv';
import { describe, expect, it } from 'vitest';

// Resolve the app-root config files relative to this test (src/lib/config/).
const appRoot = join(__dirname, '../../../');

const schema = JSON.parse(
  readFileSync(join(appRoot, 'squareone.config.schema.json'), 'utf8')
);

// Validate the way loadAppConfig() does: Ajv fills schema defaults in place.
function validateConfig(data: Record<string, unknown>) {
  const ajv = new Ajv({ useDefaults: true, removeAdditional: true });
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid, errors: validate.errors, data };
}

describe('discovery-backed config keys', () => {
  it.each(['siteName', 'environmentName', 'baseUrl'])(
    'declares %s without a schema default',
    (key) => {
      expect(schema.properties[key]).toBeDefined();
      expect(schema.properties[key]).not.toHaveProperty('default');
    }
  );

  it('validates a config that omits them, leaving them unset', () => {
    const { valid, data } = validateConfig({});
    expect(valid).toBe(true);
    expect(data).not.toHaveProperty('siteName');
    expect(data).not.toHaveProperty('environmentName');
    expect(data).not.toHaveProperty('baseUrl');
  });

  it('still accepts explicit values', () => {
    const { valid, data } = validateConfig({
      siteName: 'Configured Site',
      environmentName: 'idfdev',
      baseUrl: 'https://data-dev.lsst.cloud',
    });
    expect(valid).toBe(true);
    expect(data).toMatchObject({
      siteName: 'Configured Site',
      environmentName: 'idfdev',
      baseUrl: 'https://data-dev.lsst.cloud',
    });
  });
});

describe('coManageRegistryUrl config key', () => {
  it('is marked deprecated in the schema', () => {
    expect(schema.properties.coManageRegistryUrl.deprecated).toBe(true);
  });

  it('points to the discovery source in its description', () => {
    expect(schema.properties.coManageRegistryUrl.description).toMatch(
      /services\.ui\.comanage/
    );
  });

  it('is still accepted so existing configs validate', () => {
    const { valid, data } = validateConfig({
      coManageRegistryUrl: 'https://id.lsst.cloud',
    });
    expect(valid).toBe(true);
    expect(data.coManageRegistryUrl).toBe('https://id.lsst.cloud');
  });
});
