import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import HomepageHero from '../../components/HomepageHero';
import { holdCrossOriginFetch } from '../support/fetchStub';
import { withServiceAccess } from '../support/serviceAccess';

const meta: Meta<typeof HomepageHero> = {
  title: 'Pages/Homepage',
  component: HomepageHero,
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Without service discovery configured, every aspect card is shown. */
export const Homepage: Story = {
  args: {},
};

/**
 * With `mockDiscovery`, where the portal requires `exec:portal` and Nublado
 * `exec:notebook`, an anonymous visitor still sees both cards (scopes are
 * unknown until sign-in).
 */
export const Anonymous: Story = {
  decorators: [withServiceAccess(null)],
  beforeEach: holdCrossOriginFetch,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { level: 2, name: 'Portal' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Notebooks' })
    ).toBeInTheDocument();
  },
};

/** A signed-in user holding both scopes sees both cards. */
export const SignedInWithBothScopes: Story = {
  decorators: [withServiceAccess({ scopes: ['exec:portal', 'exec:notebook'] })],
  beforeEach: holdCrossOriginFetch,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { level: 2, name: 'Portal' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { level: 2, name: 'Notebooks' })
    ).toBeInTheDocument();
  },
};

/** A signed-in user lacking `exec:portal` does not see the Portal card. */
export const SignedInWithoutPortal: Story = {
  decorators: [withServiceAccess({ scopes: ['exec:notebook', 'read:tap'] })],
  beforeEach: holdCrossOriginFetch,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { level: 2, name: 'Notebooks' })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('heading', { level: 2, name: 'Portal' })
    ).not.toBeInTheDocument();
  },
};

/** A signed-in user lacking `exec:notebook` does not see the Notebooks card. */
export const SignedInWithoutNotebooks: Story = {
  decorators: [withServiceAccess({ scopes: ['exec:portal', 'read:tap'] })],
  beforeEach: holdCrossOriginFetch,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { level: 2, name: 'Portal' })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('heading', { level: 2, name: 'Notebooks' })
    ).not.toBeInTheDocument();
  },
};
