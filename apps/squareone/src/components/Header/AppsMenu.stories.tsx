import { PrimaryNavigation } from '@lsst-sqre/squared';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import { holdCrossOriginFetch } from '../../stories/support/fetchStub';
import { withServiceAccess } from '../../stories/support/serviceAccess';
import AppsMenu from './AppsMenu';

/*
 * The header's Apps menu derived from `mockDiscovery`: Times Square (the
 * `times-square` application is enabled), then the Argo CD, Chronograf,
 * Kafdrop, and WebDAV UI services the visitor's scopes allow, then any
 * configured `appLinks`. Argo CD and Chronograf declare no scopes in
 * discovery, so the menu's associated `exec:admin` scope gates them.
 */
const meta: Meta<typeof AppsMenu> = {
  title: 'Components/AppsMenu',
  component: AppsMenu,
  tags: ['test'],
  beforeEach: holdCrossOriginFetch,
  parameters: {
    nextjs: { appDirectory: true },
  },
  render: () => (
    <PrimaryNavigation aria-label="Main">
      <AppsMenu />
    </PrimaryNavigation>
  ),
};

export default meta;
type Story = StoryObj<typeof AppsMenu>;

/** Open the menu and return its link labels, in order. */
async function openMenuLabels(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(await canvas.findByRole('button', { name: 'Apps' }));
  await canvas.findByRole('link', { name: 'Times Square' });
  return canvas.getAllByRole('link').map((link) => link.textContent);
}

/** An admin with no configured `appLinks` sees the discovery-derived items. */
export const DiscoveryOnly: Story = {
  decorators: [withServiceAccess({ scopes: ['exec:admin', 'exec:notebook'] })],
  play: async ({ canvasElement }) => {
    await expect(await openMenuLabels(canvasElement)).toEqual([
      'Times Square',
      'Argo CD',
      'Chronograf metrics viewer',
    ]);
  },
};

/**
 * Configured `appLinks` follow the discovery items; entries whose href a
 * discovery item already has (Times Square, and Argo CD's `/argo-cd/`) are
 * dropped.
 */
export const AppLinksMerged: Story = {
  decorators: [
    withServiceAccess(
      { scopes: ['exec:admin', 'exec:notebook'] },
      {
        appLinks: [
          { label: 'Times Square', href: '/times-square/', internal: true },
          { label: 'Argo CD', href: '/argo-cd/', internal: false },
          { label: 'FOV Quicklook', href: '/fov-quicklook/', internal: false },
          { label: 'Nightly Digest', href: '/nightlydigest/', internal: false },
        ],
      }
    ),
  ],
  play: async ({ canvasElement }) => {
    await expect(await openMenuLabels(canvasElement)).toEqual([
      'Times Square',
      'Argo CD',
      'Chronograf metrics viewer',
      'FOV Quicklook',
      'Nightly Digest',
    ]);
  },
};

/** A user without `exec:admin` sees Times Square but no admin tools. */
export const ScopeFiltered: Story = {
  decorators: [withServiceAccess({ scopes: ['exec:notebook', 'read:tap'] })],
  play: async ({ canvasElement }) => {
    await expect(await openMenuLabels(canvasElement)).toEqual(['Times Square']);
  },
};

/** `exec:internal-tools` adds Kafdrop, which discovery gates on that scope. */
export const WithInternalTools: Story = {
  decorators: [
    withServiceAccess({ scopes: ['exec:admin', 'exec:internal-tools'] }),
  ],
  play: async ({ canvasElement }) => {
    await expect(await openMenuLabels(canvasElement)).toEqual([
      'Times Square',
      'Argo CD',
      'Chronograf metrics viewer',
      'Kafdrop Kafka viewer',
    ]);
  },
};
