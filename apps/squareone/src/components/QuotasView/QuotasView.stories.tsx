import type { Quota } from '@lsst-sqre/gafaelfawr-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import QuotasView from './QuotasView';

const meta: Meta<typeof QuotasView> = {
  title: 'Components/QuotasView',
  component: QuotasView,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
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
