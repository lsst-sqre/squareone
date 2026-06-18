import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import RenderedMarkdown from './RenderedMarkdown';

const meta: Meta<typeof RenderedMarkdown> = {
  title: 'Components/RenderedMarkdown',
  component: RenderedMarkdown,
};

export default meta;
type Story = StoryObj<typeof RenderedMarkdown>;

// Inline Markdown, the shape a notification summary takes.
export const Inline: Story = {
  args: {
    markdown:
      'You are approaching your disk space **quota** limit — see the [docs](https://rsp.lsst.io).',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('quota')).toBeInTheDocument();
    await expect(canvas.getByRole('link', { name: 'docs' })).toHaveAttribute(
      'href',
      'https://rsp.lsst.io'
    );
  },
};

// Full GitHub-flavored Markdown, the shape a notification body takes.
export const GitHubFlavored: Story = {
  args: {
    markdown: [
      '## Maintenance window',
      '',
      'The RSP will be unavailable on **Saturday** for ~~minor~~ major upgrades.',
      '',
      '| Service | Status |',
      '| ------- | ------ |',
      '| TAP     | down   |',
      '| Portal  | up     |',
    ].join('\n'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('table')).toBeInTheDocument();
    await expect(canvas.getByText('minor')).toBeInTheDocument();
  },
};

// Empty input renders nothing rather than a stray paragraph.
export const Empty: Story = {
  args: {
    markdown: '',
  },
};
