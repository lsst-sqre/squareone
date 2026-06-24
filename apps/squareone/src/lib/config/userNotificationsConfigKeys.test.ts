import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Ajv from 'ajv';
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

describe('user notifications feature-flag config keys', () => {
  it('declares enableUserNotifications in the schema with title, description, and default', () => {
    expect(schema.properties.enableUserNotifications).toMatchObject({
      type: 'boolean',
      default: false,
    });
    expect(schema.properties.enableUserNotifications.title).toEqual(
      expect.any(String)
    );
    expect(schema.properties.enableUserNotifications.description).toEqual(
      expect.any(String)
    );
  });

  it('declares userNotificationsPollIntervalSeconds in the schema with title, description, default, and minimum', () => {
    expect(
      schema.properties.userNotificationsPollIntervalSeconds
    ).toMatchObject({
      type: 'integer',
      minimum: 30,
      default: 300,
    });
    expect(
      schema.properties.userNotificationsPollIntervalSeconds.title
    ).toEqual(expect.any(String));
    expect(
      schema.properties.userNotificationsPollIntervalSeconds.description
    ).toEqual(expect.any(String));
  });

  it('sets the development defaults in squareone.config.yaml', () => {
    expect(devConfig.enableUserNotifications).toBe(false);
    expect(devConfig.userNotificationsPollIntervalSeconds).toBe(300);
  });

  it('applies the documented defaults via Ajv when the keys are absent (resolvable through the config pipeline)', () => {
    // Mirrors loader.ts: validation fills defaults so getStaticConfig() /
    // useStaticConfig() always resolve these keys even when a Phalanx config
    // omits them.
    const ajv = new Ajv({ useDefaults: true, removeAdditional: true });
    const validate = ajv.compile(schema);
    const data: Record<string, unknown> = {};
    validate(data);

    expect(data.enableUserNotifications).toBe(false);
    expect(data.userNotificationsPollIntervalSeconds).toBe(300);
  });
});
