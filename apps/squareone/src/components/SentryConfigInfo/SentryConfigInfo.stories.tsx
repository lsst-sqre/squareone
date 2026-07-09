import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import { ConfigProvider } from '../../contexts/rsc';
import type { AppConfigContextValue } from '../../hooks/useStaticConfig';
import SentryConfigInfo from './SentryConfigInfo';

// Minimal app config shared by the stories; each story layers the Sentry
// fields it wants to demonstrate on top.
const baseConfig: AppConfigContextValue = {
  siteName: 'Rubin Science Platform',
  siteDescription: 'The Rubin Science Platform.',
  showPreview: false,
  previewLink: 'https://rsp.lsst.io/roadmap.html',
  enableUserNotifications: false,
  userNotificationsPollIntervalSeconds: 300,
  docsBaseUrl: 'https://rsp.lsst.io',
  enableAppsMenu: false,
  appLinks: [],
  baseUrl: 'https://data.lsst.cloud',
  coManageRegistryUrl: null,
  timesSquareUrl: null,
  environmentName: 'idfprod',
  plausibleDomain: null,
  mdxDir: '/mock/mdx',
};

const enabledConfig: AppConfigContextValue = {
  ...baseConfig,
  sentryDsn: 'https://examplePublicKey@o0.ingest.sentry.io/0',
  sentryTracesSampleRate: 0.2,
  sentryReplaysSessionSampleRate: 0,
  sentryReplaysOnErrorSampleRate: 1,
  sentryOrg: 'rubin-observatory',
  sentryProject: 'squareone',
};

const meta: Meta<typeof SentryConfigInfo> = {
  title: 'Components/SentryConfigInfo',
  component: SentryConfigInfo,
};

export default meta;
type Story = StoryObj<typeof SentryConfigInfo>;

// SentryConfigInfo reads config via useStaticConfig(); each story renders it
// inside a ConfigProvider so it can show a different configuration.

// Sentry enabled with org/project set: all fields populated and the dashboard
// link visible.
export const Enabled: Story = {
  render: () => (
    <ConfigProvider configPromise={Promise.resolve(enabledConfig)}>
      <SentryConfigInfo />
    </ConfigProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Enabled')).toBeInTheDocument();

    const link = await canvas.findByRole('link', {
      name: /sentry dashboard/i,
    });
    await expect(link).toHaveAttribute(
      'href',
      'https://rubin-observatory.sentry.io/projects/squareone/'
    );
  },
};

// The config list under the dark toolbar theme, so the migration of the
// `.label` (<dt>) color from the fixed `--rsd-color-gray-500` scale token onto
// the adaptive `--rsd-component-text-secondary-color` token is visually
// verifiable in dark mode and can't silently rot — the "Status",
// "Environment", sample-rate, and "Base URL" labels previously rendered
// near-invisible gray-500 on the dark background. Pins the
// `withThemeByDataAttribute` global to `dark` so the toolbar renders the story
// with `data-theme="dark"` (toggle the toolbar theme to compare against the
// light stories above).
export const Dark: Story = {
  globals: {
    theme: 'dark',
  },
  render: () => (
    <ConfigProvider configPromise={Promise.resolve(enabledConfig)}>
      <SentryConfigInfo />
    </ConfigProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The value renders alongside its adaptive, legible <dt> label (which maps
    // to a token that re-maps in both themes rather than the old near-invisible
    // fixed gray-500).
    await expect(await canvas.findByText('Enabled')).toBeInTheDocument();
  },
};

// No DSN and no org/project: status reads "Disabled", unset sample rates show
// "Not set", and the dashboard link is hidden.
export const Disabled: Story = {
  render: () => (
    <ConfigProvider configPromise={Promise.resolve(baseConfig)}>
      <SentryConfigInfo />
    </ConfigProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Disabled')).toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: /sentry dashboard/i })
    ).not.toBeInTheDocument();
  },
};

// Disabled but with org/project still set (their config defaults): status reads
// "Disabled" and the dashboard link stays hidden because Sentry is not enabled,
// even though the slugs that build the URL are populated.
export const DisabledWithOrgProject: Story = {
  render: () => (
    <ConfigProvider
      configPromise={Promise.resolve({
        ...baseConfig,
        sentryOrg: 'rubin-observatory',
        sentryProject: 'squareone',
      })}
    >
      <SentryConfigInfo />
    </ConfigProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(await canvas.findByText('Disabled')).toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: /sentry dashboard/i })
    ).not.toBeInTheDocument();
  },
};
