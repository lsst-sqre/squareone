import { render } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import type { StaticConfig } from '../lib/config/rsc';
import SentryConfigScript from './SentryConfigScript';

// Only the fields SentryConfigScript reads matter for these tests.
const baseConfig = {
  sentryDsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  environmentName: 'idfdev',
  sentryTracesSampleRate: 0.5,
  sentryReplaysSessionSampleRate: 0.1,
  sentryReplaysOnErrorSampleRate: 1.0,
  baseUrl: 'https://data-dev.lsst.cloud',
} as StaticConfig;

function renderInjectedConfig(config: StaticConfig) {
  const { container } = render(<SentryConfigScript config={config} />);
  const script = container.querySelector('script');
  if (!script) return null;
  const match = script.innerHTML.match(/^window\.__SENTRY_CONFIG__ = (.*);$/);
  if (!match) throw new Error('Unexpected script payload');
  return JSON.parse(match[1]);
}

describe('SentryConfigScript', () => {
  const originalRelease = process.env.SENTRY_RELEASE;

  afterEach(() => {
    if (originalRelease === undefined) {
      delete process.env.SENTRY_RELEASE;
    } else {
      process.env.SENTRY_RELEASE = originalRelease;
    }
  });

  it('includes the git SHA as release when SENTRY_RELEASE is set', () => {
    process.env.SENTRY_RELEASE = '6eba6658ab0cb5a4bdcba668417ab0969bc65fb3';
    const injected = renderInjectedConfig(baseConfig);
    expect(injected.release).toBe('6eba6658ab0cb5a4bdcba668417ab0969bc65fb3');
  });

  it('omits release when SENTRY_RELEASE is unset', () => {
    delete process.env.SENTRY_RELEASE;
    const injected = renderInjectedConfig(baseConfig);
    expect(injected).not.toHaveProperty('release');
  });

  it('passes through the DSN and environment', () => {
    delete process.env.SENTRY_RELEASE;
    const injected = renderInjectedConfig(baseConfig);
    expect(injected.dsn).toBe(baseConfig.sentryDsn);
    expect(injected.environment).toBe('idfdev');
  });

  it('renders nothing without a DSN', () => {
    const injected = renderInjectedConfig({
      ...baseConfig,
      sentryDsn: undefined,
    } as StaticConfig);
    expect(injected).toBeNull();
  });
});
