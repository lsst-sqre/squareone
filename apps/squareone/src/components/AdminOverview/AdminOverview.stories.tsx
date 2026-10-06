import {
  mockDiscovery2x,
  mockDiscoveryDataDev,
} from '@lsst-sqre/repertoire-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import AdminOverview from './AdminOverview';

const meta: Meta<typeof AdminOverview> = {
  title: 'Components/AdminOverview',
  component: AdminOverview,
  parameters: {
    layout: 'padded',
  },
  // Run these stories as interaction tests in the `storybook` vitest project.
  tags: ['test'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The live data-dev (idfdev) Repertoire 3.0.0 discovery document: the
 * Environment section is titled by the environment's long title and lists its
 * Phalanx label, name, and description, with a link to its Phalanx docs.
 */
export const DataDev: Story = {
  args: {
    discovery: mockDiscoveryDataDev,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('heading', { level: 1, name: 'Overview' })
    ).toBeInTheDocument();

    const environment = canvas.getByRole('region', {
      name: 'SQuaRE RSP development',
    });
    const section = within(environment);
    await expect(section.getByText('idfdev')).toBeInTheDocument();
    await expect(section.getByText('data-dev.lsst.cloud')).toBeInTheDocument();
    await expect(
      section.getByText(/^A development environment/)
    ).toBeInTheDocument();
    await expect(
      section.getByRole('link', { name: 'Phalanx documentation' })
    ).toHaveAttribute('href', 'https://phalanx.lsst.io/environments/idfdev/');
  },
};

/**
 * An environment still on Repertoire 2.x (the production 2.1.0 document):
 * there is no `environment` object, so the section falls back to an
 * "Environment" heading and shows only the deprecated `environment_name`.
 */
export const Repertoire2x: Story = {
  args: {
    discovery: mockDiscovery2x,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const environment = canvas.getByRole('region', { name: 'Environment' });
    const section = within(environment);
    await expect(section.getByText('data.lsst.cloud')).toBeInTheDocument();
    await expect(section.queryByText('Phalanx label')).not.toBeInTheDocument();
    await expect(section.queryByRole('link')).not.toBeInTheDocument();
  },
};
