import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';
import ServiceTokenPageClient from '../../app/admin/service-token/ServiceTokenPageClient';

// The admin service-token page placeholder. The creation form and the
// manage-existing-tokens sections are filled in by later tasks; this story
// covers the scaffolded heading and placeholder sections.
const meta: Meta<typeof ServiceTokenPageClient> = {
  title: 'Pages/Admin/ServiceTokenPage',
  component: ServiceTokenPageClient,
};

export default meta;
type Story = StoryObj<typeof ServiceTokenPageClient>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      await canvas.findByRole('heading', { level: 1, name: 'Service tokens' })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { name: /create a service token/i })
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('heading', { name: /manage existing tokens/i })
    ).toBeInTheDocument();
  },
};
