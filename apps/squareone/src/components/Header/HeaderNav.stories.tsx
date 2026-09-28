import { mockUserInfo } from '@lsst-sqre/gafaelfawr-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import { holdCrossOriginFetch } from '../../stories/support/fetchStub';
import { withServiceAccess } from '../../stories/support/serviceAccess';
import HeaderNav from './HeaderNav';

/*
 * The header navigation rendered against `mockDiscovery`, where the portal
 * requires `exec:portal` and Nublado `exec:notebook`: Portal and Notebooks are
 * shown only to visitors who may use them. The seeded user info puts a
 * signed-in user's menu, or an anonymous visitor's "Log in" link, in the user
 * navigation from the first render.
 */
const meta: Meta<typeof HeaderNav> = {
  title: 'Components/HeaderNav',
  component: HeaderNav,
  beforeEach: holdCrossOriginFetch,
  parameters: {
    nextjs: { appDirectory: true },
  },
};

export default meta;
type Story = StoryObj<typeof HeaderNav>;

/**
 * An anonymous visitor sees both entries (scopes are unknown until sign-in)
 * and a "Log in" link rather than a user menu.
 */
export const Anonymous: Story = {
  decorators: [withServiceAccess(null)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('link', { name: 'Portal' })
    ).toHaveAttribute('href', 'https://data.lsst.cloud/portal/app');
    await expect(
      canvas.getByRole('link', { name: 'Notebooks' })
    ).toHaveAttribute('href', 'https://data.lsst.cloud/nb');

    const userNav = within(
      canvas.getByRole('navigation', { name: 'User menu' })
    );
    await expect(
      userNav.getByRole('link', { name: 'Log in' })
    ).toBeInTheDocument();
    await expect(userNav.queryByRole('button')).not.toBeInTheDocument();
  },
};

/**
 * A signed-in user holding both scopes sees both entries, and their user menu
 * (named for their username) rather than a "Log in" link.
 */
export const SignedInWithBothScopes: Story = {
  decorators: [withServiceAccess({ scopes: ['exec:portal', 'exec:notebook'] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('link', { name: 'Portal' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: 'Notebooks' })
    ).toBeInTheDocument();

    const userNav = within(
      canvas.getByRole('navigation', { name: 'User menu' })
    );
    await expect(
      userNav.getByRole('button', { name: mockUserInfo.username })
    ).toBeInTheDocument();
    await expect(
      userNav.queryByRole('link', { name: 'Log in' })
    ).not.toBeInTheDocument();
  },
};

/** A signed-in user lacking `exec:portal` gets no Portal entry. */
export const SignedInWithoutPortal: Story = {
  decorators: [withServiceAccess({ scopes: ['exec:notebook', 'read:tap'] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('link', { name: 'Notebooks' })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: 'Portal' })
    ).not.toBeInTheDocument();
  },
};

/** A signed-in user lacking `exec:notebook` gets no Notebooks entry. */
export const SignedInWithoutNotebooks: Story = {
  decorators: [withServiceAccess({ scopes: ['exec:portal', 'read:tap'] })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('link', { name: 'Portal' })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: 'Notebooks' })
    ).not.toBeInTheDocument();
  },
};
