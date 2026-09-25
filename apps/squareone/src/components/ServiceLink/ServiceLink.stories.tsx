import { mockDiscovery } from '@lsst-sqre/repertoire-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import type { ServiceLinkResult } from '../../lib/serviceLink/types';
import ServiceLink from './ServiceLink';

// The COmanage UI service URL from the Repertoire 3.0.0 mock discovery, as
// published (with its trailing slash).
const comanageResult: ServiceLinkResult = {
  status: 'ok',
  url: mockDiscovery.services.ui.comanage.url,
};

const meta: Meta<typeof ServiceLink> = {
  title: 'Components/ServiceLink',
  component: ServiceLink,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs', 'test'],
  args: {
    result: comanageResult,
  },
  // Inline links sit in MDX prose, as in settings__index.mdx.
  render: (args) => (
    <p>
      Your account settings are available at <ServiceLink {...args} />.
    </p>
  ),
};

export default meta;
type Story = StoryObj<typeof ServiceLink>;

// <ServiceLink service="comanage" />: the discovered URL, without its trailing
// slash, is the link text.
export const Linked: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link', { name: 'https://id.lsst.cloud' });
    await expect(link).toHaveAttribute('href', 'https://id.lsst.cloud/');
  },
};

// <ServiceLink service="comanage">Account settings</ServiceLink>: the children
// are the link text.
export const CustomText: Story = {
  args: {
    children: 'your account page',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link', { name: 'your account page' });
    await expect(link).toHaveAttribute('href', 'https://id.lsst.cloud/');
  },
};

// <ServiceLink service="comanage" variant="cta">…</ServiceLink>: a
// call-to-action button, as in the development settings__index.mdx.
export const CallToAction: Story = {
  args: {
    variant: 'cta',
    children: 'Manage account settings',
  },
  render: (args) => <ServiceLink {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByRole('link', {
      name: 'Manage account settings',
    });
    await expect(link).toHaveAttribute('href', 'https://id.lsst.cloud/');
  },
};

// No repertoireUrl, discovery unavailable, or the service missing from
// discovery: the children render as plain text, with no link.
export const FallbackWithChildren: Story = {
  args: {
    result: { status: 'missing' },
    children: 'your account page',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
    await expect(
      canvas.getByText(/available at your account page\./)
    ).toBeInTheDocument();
  },
};

// A self-closing link with no discovered URL renders nothing, never an empty
// or broken link.
export const FallbackSelfClosing: Story = {
  args: {
    result: { status: 'unavailable' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
    await expect(canvas.getByText(/available at \./)).toBeInTheDocument();
  },
};

// A call-to-action with no discovered URL renders nothing at all.
export const FallbackCallToAction: Story = {
  args: {
    result: { status: 'omitted' },
    variant: 'cta',
    children: 'Manage account settings',
  },
  render: (args) => (
    <div data-testid="cta-container">
      <ServiceLink {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('cta-container')).toBeEmptyDOMElement();
  },
};

export const Dark: Story = {
  // Pins the theme global to dark, which in docs mode would flip the shared
  // <html data-theme> for every story on the page; keep it out of autodocs.
  tags: ['!autodocs'],
  globals: {
    theme: 'dark',
  },
};
