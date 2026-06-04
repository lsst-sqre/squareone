import { render, screen } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the config hook so the component can be rendered with arbitrary config
// without a ConfigProvider/Suspense boundary.
vi.mock('../../hooks/useStaticConfig', () => ({
  useStaticConfig: vi.fn(),
}));

// Import after mocking.
import { useStaticConfig } from '../../hooks/useStaticConfig';
import type { AppConfig } from '../../lib/config/loader';
import SentryConfigInfo from './SentryConfigInfo';

// Build a config object with only the fields the component reads, cast to the
// full AppConfig shape.
function makeConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    environmentName: 'production',
    baseUrl: 'https://data.example.org',
    sentryDsn: 'https://abc@o1.ingest.sentry.io/123',
    sentryTracesSampleRate: 0.25,
    sentryReplaysSessionSampleRate: 0.5,
    sentryReplaysOnErrorSampleRate: 1,
    sentryOrg: 'rubin-observatory',
    sentryProject: 'squareone',
    ...overrides,
  } as AppConfig;
}

describe('SentryConfigInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('shows Sentry as enabled when a DSN is configured', () => {
    vi.mocked(useStaticConfig).mockReturnValue(makeConfig());
    render(<SentryConfigInfo />);
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  test('shows Sentry as disabled when no DSN is configured', () => {
    vi.mocked(useStaticConfig).mockReturnValue(
      makeConfig({ sentryDsn: undefined })
    );
    render(<SentryConfigInfo />);
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  test('displays the environment name and base URL', () => {
    vi.mocked(useStaticConfig).mockReturnValue(makeConfig());
    render(<SentryConfigInfo />);
    expect(screen.getByText('production')).toBeInTheDocument();
    expect(screen.getByText('https://data.example.org')).toBeInTheDocument();
  });

  test('displays the traces and replay sample rates', () => {
    vi.mocked(useStaticConfig).mockReturnValue(makeConfig());
    render(<SentryConfigInfo />);
    expect(screen.getByText('0.25')).toBeInTheDocument();
    expect(screen.getByText('0.5')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  test('shows "Not set" for an unset sample rate', () => {
    vi.mocked(useStaticConfig).mockReturnValue(
      makeConfig({ sentryTracesSampleRate: undefined })
    );
    render(<SentryConfigInfo />);
    expect(screen.getByText('Not set')).toBeInTheDocument();
  });

  test('shows a Sentry dashboard link when sentryOrg and sentryProject are set', () => {
    vi.mocked(useStaticConfig).mockReturnValue(makeConfig());
    render(<SentryConfigInfo />);
    const link = screen.getByRole('link', { name: /sentry dashboard/i });
    expect(link).toHaveAttribute(
      'href',
      'https://rubin-observatory.sentry.io/projects/squareone/'
    );
  });

  test('hides the dashboard link when sentryOrg is unset', () => {
    vi.mocked(useStaticConfig).mockReturnValue(
      makeConfig({ sentryOrg: undefined })
    );
    render(<SentryConfigInfo />);
    expect(
      screen.queryByRole('link', { name: /sentry dashboard/i })
    ).not.toBeInTheDocument();
  });

  test('hides the dashboard link when sentryProject is unset', () => {
    vi.mocked(useStaticConfig).mockReturnValue(
      makeConfig({ sentryProject: undefined })
    );
    render(<SentryConfigInfo />);
    expect(
      screen.queryByRole('link', { name: /sentry dashboard/i })
    ).not.toBeInTheDocument();
  });

  test('hides the dashboard link when Sentry is disabled even though sentryOrg and sentryProject are set', () => {
    vi.mocked(useStaticConfig).mockReturnValue(
      makeConfig({
        sentryDsn: undefined,
        sentryOrg: 'rubin-observatory',
        sentryProject: 'squareone',
      })
    );
    render(<SentryConfigInfo />);
    expect(screen.getByText('Disabled')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /sentry dashboard/i })
    ).not.toBeInTheDocument();
  });
});
