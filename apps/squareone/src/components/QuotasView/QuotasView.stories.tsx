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

/** The titles of the rendered sections, in page order. */
function getSectionTitles(canvasElement: HTMLElement): (string | null)[] {
  return within(canvasElement)
    .getAllByRole('heading', { level: 2 })
    .map((heading) => heading.textContent);
}

/** The section titled by the given heading, for assertions scoped to it. */
function getSection(canvasElement: HTMLElement, title: string): HTMLElement {
  const section = within(canvasElement)
    .getByRole('heading', { level: 2, name: title })
    .closest('section');
  if (!section) {
    throw new Error(`The "${title}" heading is not inside a section`);
  }
  return section;
}

/** The keys and values of a section's rows, in order. */
function getRows(section: HTMLElement): [string | null, string | null][] {
  const rows = within(section);
  const values = rows.getAllByRole('definition');
  return rows
    .getAllByRole('term')
    .map((term, i) => [term.textContent, values[i].textContent]);
}

// Full quota data with all sections
const fullQuota: Quota = {
  api: {
    datalinker: 500,
    hips: 2000,
    tap: 500,
    'vo-cutouts': 100,
  },
  disk: {
    '/home': 32212254720,
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
  disk: {},
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
  disk: {},
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
  disk: {},
  notebook: null,
  tap: {},
};

// Quota with only TAP data
const tapOnlyQuota: Quota = {
  api: {},
  disk: {},
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

// Quota with a disk quota for the home directory alongside a notebook quota
const storageQuota: Quota = {
  api: {},
  disk: {
    '/home': 32212254720,
  },
  notebook: {
    cpu: 4,
    memory: 16,
    spawn: true,
  },
  tap: {},
};

// Disk quotas on several mounts, listed out of order
const multipleMountsQuota: Quota = {
  api: {},
  disk: {
    '/scratch': 1099511627776,
    '/home': 32212254720,
    '/project': 1610612736,
  },
  notebook: null,
  tap: {},
};

// Notebook and TAP quotas with no disk quotas
const noStorageQuota: Quota = {
  api: {},
  disk: {},
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

// API quotas keyed by the Gafaelfawr quota labels that data-dev's service
// discovery (Repertoire 3.0) describes.
const labelledApiQuota: Quota = {
  api: {
    'muster-quota': 5,
    sia: 20,
    tap: 100,
  },
  disk: {},
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

// Two quota labels declared by one service (TAP): a second, illustrative
// label alongside data-dev's "tap".
const sameServiceApiQuota: Quota = {
  api: {
    tap: 100,
    'tap-sync': 50,
  },
  disk: {},
  notebook: null,
  tap: {},
};

const quotaLabelIndexWithSameServiceLabels: QuotaLabelIndex = {
  ...quotaLabelIndex,
  'tap-sync': { ...quotaLabelIndex.tap, labelTitle: 'Synchronous queries' },
};

// Minimal quota with no sections (edge case)
const emptyQuota: Quota = {
  api: {},
  disk: {},
  notebook: null,
  tap: {},
};

/**
 * Full quota display with every section, in page order: Notebooks, Storage,
 * Concurrent queries, and Rate limits.
 */
export const FullQuota: Story = {
  args: {
    quota: fullQuota,
  },
  play: async ({ canvasElement }) => {
    await expect(getSectionTitles(canvasElement)).toEqual([
      'Notebooks',
      'Storage',
      'Concurrent queries',
      'Rate limits',
    ]);
  },
};

/**
 * The Storage section lists the disk quota of each filesystem mount, directly
 * below the Notebooks section.
 */
export const Storage: Story = {
  args: {
    quota: storageQuota,
  },
  play: async ({ canvasElement }) => {
    const section = getSection(canvasElement, 'Storage');

    await expect(section).toHaveAttribute('id', 'storage');
    await expect(
      within(section).getByText(
        'Storage quota for individual filesystem mounts.'
      )
    ).toBeInTheDocument();
    await expect(getRows(section)).toEqual([['/home', '30 GiB']]);
    await expect(getSectionTitles(canvasElement)).toEqual([
      'Notebooks',
      'Storage',
    ]);
  },
};

/**
 * Disk quotas on several mounts get one row each, sorted by mount point.
 */
export const StorageMultipleMounts: Story = {
  args: {
    quota: multipleMountsQuota,
  },
  play: async ({ canvasElement }) => {
    await expect(getRows(getSection(canvasElement, 'Storage'))).toEqual([
      ['/home', '30 GiB'],
      ['/project', '1.5 GiB'],
      ['/scratch', '1 TiB'],
    ]);
  },
};

/**
 * Without disk quotas the Storage section is not rendered.
 */
export const NoStorage: Story = {
  args: {
    quota: noStorageQuota,
  },
  play: async ({ canvasElement }) => {
    await expect(getSectionTitles(canvasElement)).toEqual([
      'Notebooks',
      'Concurrent queries',
    ]);
    await expect(canvasElement.querySelector('#storage')).toBeNull();
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
        name: 'Table access protocol (TAP) documentation (TAP API calls)',
      })
    ).toHaveAttribute('href', 'https://www.ivoa.net/documents/TAP/');
    await expect(
      canvas.getByRole('link', {
        name: 'Simple image access (SIA) documentation (Image requests)',
      })
    ).toHaveAttribute('href', 'https://www.ivoa.net/documents/SIA/');
    await expect(canvas.getAllByRole('link')).toHaveLength(2);
  },
};

/**
 * Two quotas of one service: each row's documentation link names the row's
 * label title, so screen-reader users can tell the links apart.
 */
export const SameServiceLabels: Story = {
  args: {
    quota: sameServiceApiQuota,
    quotaLabelIndex: quotaLabelIndexWithSameServiceLabels,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('link', {
        name: 'Table access protocol (TAP) documentation (TAP API calls)',
      })
    ).toHaveAttribute('href', 'https://www.ivoa.net/documents/TAP/');
    await expect(
      canvas.getByRole('link', {
        name: 'Table access protocol (TAP) documentation (Synchronous queries)',
      })
    ).toHaveAttribute('href', 'https://www.ivoa.net/documents/TAP/');
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
