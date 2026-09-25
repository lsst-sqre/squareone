import type { Quota } from '@lsst-sqre/gafaelfawr-client';
import {
  createDiscoveryQuery,
  mockDiscovery,
  type QuotaLabelIndex,
} from '@lsst-sqre/repertoire-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import QuotasView from './QuotasView';

const meta: Meta<typeof QuotasView> = {
  title: 'Components/QuotasView',
  component: QuotasView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs', 'test'],
};

export default meta;
type Story = StoryObj<typeof QuotasView>;

// Full quota data with all sections
const fullQuota: Quota = {
  api: {
    datalinker: 500,
    hips: 2000,
    tap: 500,
    'vo-cutouts': 100,
  },
  notebook: {
    cpu: 4,
    memory: 16,
    spawn: true,
  },
  tap: {
    qserv: {
      concurrent: 5,
    },
  },
};

// Quota with notebook spawning disabled
const quotaWithSpawnDisabled: Quota = {
  api: {
    datalinker: 500,
    hips: 2000,
  },
  notebook: {
    cpu: 2,
    memory: 8,
    spawn: false,
  },
  tap: {
    qserv: {
      concurrent: 3,
    },
  },
};

// Quota with only notebook data
const notebookOnlyQuota: Quota = {
  api: {},
  notebook: {
    cpu: 8,
    memory: 32,
    spawn: true,
  },
  tap: {},
};

// Quota with only API data
const apiOnlyQuota: Quota = {
  api: {
    datalinker: 1000,
    hips: 5000,
    tap: 1000,
  },
  notebook: null,
  tap: {},
};

// Quota with only TAP data
const tapOnlyQuota: Quota = {
  api: {},
  notebook: null,
  tap: {
    qserv: {
      concurrent: 10,
    },
    'tap-dev': {
      concurrent: 2,
    },
  },
};

// API quotas keyed by the Gafaelfawr quota labels that data-dev's service
// discovery (Repertoire 3.0) describes.
const labelledApiQuota: Quota = {
  api: {
    'muster-quota': 5,
    sia: 20,
    tap: 100,
  },
  notebook: null,
  tap: {},
};

// The quota label index as data-dev publishes it: muster's label is not (yet)
// flagged internal.
const quotaLabelIndex: QuotaLabelIndex =
  createDiscoveryQuery(mockDiscovery).getQuotaLabelIndex();

// The same index once Phalanx flags muster's quota label internal.
const quotaLabelIndexWithInternalLabel: QuotaLabelIndex = {
  ...quotaLabelIndex,
  'muster-quota': { ...quotaLabelIndex['muster-quota'], internal: true },
};

// Minimal quota with no sections (edge case)
const emptyQuota: Quota = {
  api: {},
  notebook: null,
  tap: {},
};

/**
 * Full quota display with all three sections: Notebooks, Rate limits, and Concurrent queries.
 */
export const FullQuota: Story = {
  args: {
    quota: fullQuota,
  },
};

/**
 * Quota with notebook spawning disabled. Shows the "Spawning: Disabled" field.
 */
export const SpawnDisabled: Story = {
  args: {
    quota: quotaWithSpawnDisabled,
  },
};

/**
 * Only shows the Notebooks section.
 */
export const NotebookOnly: Story = {
  args: {
    quota: notebookOnlyQuota,
  },
};

/**
 * Only shows the Rate limits section with API quotas.
 */
export const ApiOnly: Story = {
  args: {
    quota: apiOnlyQuota,
  },
};

/**
 * Only shows the Concurrent queries section with TAP quotas.
 */
export const TapOnly: Story = {
  args: {
    quota: tapOnlyQuota,
  },
};

/**
 * Edge case: all quota sections are empty. The component renders an empty container.
 */
export const Empty: Story = {
  args: {
    quota: emptyQuota,
  },
};

/**
 * Rate limits labelled from service discovery: each row names the service and
 * what the quota counts, with a link to the service's documentation when
 * discovery has one. Muster declares no title or docs URL, so its row falls
 * back to the service name and has no link.
 */
export const LabelledRateLimits: Story = {
  args: {
    quota: labelledApiQuota,
    quotaLabelIndex,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Table access protocol (TAP) — TAP API calls')
    ).toBeInTheDocument();
    await expect(canvas.getByText('100 requests')).toBeInTheDocument();
    await expect(
      canvas.getByText('Simple image access (SIA) — Image requests')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('muster — Quota testing')
    ).toBeInTheDocument();
    await expect(canvas.queryByText('tap')).not.toBeInTheDocument();

    await expect(
      canvas.getByRole('link', {
        name: 'Table access protocol (TAP) documentation',
      })
    ).toHaveAttribute('href', 'https://www.ivoa.net/documents/TAP/');
    await expect(
      canvas.getByRole('link', {
        name: 'Simple image access (SIA) documentation',
      })
    ).toHaveAttribute('href', 'https://www.ivoa.net/documents/SIA/');
    await expect(canvas.getAllByRole('link')).toHaveLength(2);
  },
};

/**
 * A quota label that service discovery flags `internal` (here muster's
 * quota-testing label) is left out of the rate limits.
 */
export const InternalLabelHidden: Story = {
  args: {
    quota: labelledApiQuota,
    quotaLabelIndex: quotaLabelIndexWithInternalLabel,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Table access protocol (TAP) — TAP API calls')
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText('muster — Quota testing')
    ).not.toBeInTheDocument();
    await expect(canvas.queryByText('5 requests')).not.toBeInTheDocument();
  },
};

/**
 * Without a quota label index (discovery disabled, or a Repertoire 2.x
 * environment) the rate limits show the raw Gafaelfawr quota labels, with no
 * documentation links.
 */
export const UnmappedLabels: Story = {
  args: {
    quota: labelledApiQuota,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('muster-quota')).toBeInTheDocument();
    await expect(canvas.getByText('sia')).toBeInTheDocument();
    await expect(canvas.getByText('tap')).toBeInTheDocument();
    await expect(canvas.queryAllByRole('link')).toHaveLength(0);
  },
};
