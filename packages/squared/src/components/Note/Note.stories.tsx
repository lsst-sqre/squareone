import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import Note from './Note';

const meta: Meta<typeof Note> = {
  title: 'Components/Note',
  component: Note,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['note', 'warning', 'tip', 'info'],
      description: 'Type of note, affects color and label',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '600px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <p>
        This is a note callout. Use it to highlight important information that
        readers should pay attention to.
      </p>
    ),
  },
};

export const NoteType: Story = {
  args: {
    type: 'note',
    children: (
      <p>
        This is the default note type with red styling. Good for general notes
        and important information.
      </p>
    ),
  },
};

export const WarningType: Story = {
  args: {
    type: 'warning',
    children: (
      <p>
        Warning: Be careful when modifying these settings. Changes may affect
        system stability.
      </p>
    ),
  },
};

export const TipType: Story = {
  args: {
    type: 'tip',
    children: (
      <p>
        Pro tip: You can use keyboard shortcuts to speed up your workflow. Press
        Ctrl+K to open the command palette.
      </p>
    ),
  },
};

export const InfoType: Story = {
  args: {
    type: 'info',
    children: (
      <p>
        This feature was introduced in version 2.0. See the release notes for
        more details.
      </p>
    ),
  },
};

export const AllTypes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Note type="note">
        <p>Note: This is the default note type.</p>
      </Note>
      <Note type="warning">
        <p>Warning: Be careful with this action.</p>
      </Note>
      <Note type="tip">
        <p>Tip: Here's a helpful hint.</p>
      </Note>
      <Note type="info">
        <p>Info: Additional information here.</p>
      </Note>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All four note types displayed together for comparison.',
      },
    },
  },
};

export const InteractionTest: Story = {
  args: {
    type: 'warning',
    children: <p>Test content</p>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Warning')).toBeInTheDocument();
    await expect(canvas.getByText('Test content')).toBeInTheDocument();
  },
};
