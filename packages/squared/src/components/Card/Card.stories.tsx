import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import Card from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <h3>Card Title</h3>
        <p>
          This is a basic card with some content. Cards are used for
          documentation and content display.
        </p>
      </>
    ),
  },
};

export const WithLink: Story = {
  render: () => (
    <a
      href="https://example.com"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <Card>
        <h3>Clickable Card</h3>
        <p>
          Hover over this card to see the border highlight. This demonstrates
          the card's behavior when wrapped in a link.
        </p>
      </Card>
    </a>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'When wrapped in a link, the card shows a primary border on hover/focus.',
      },
    },
  },
};

export const LongContent: Story = {
  args: {
    children: (
      <>
        <h3>DP0.2 Catalog Schema</h3>
        <p>
          Schema reference for the DP0.2 catalog dataset available through the
          Table Access Protocol (TAP) service. This card contains longer content
          to show how the component handles text wrapping and maintains
          consistent padding.
        </p>
      </>
    ),
  },
};

export const InteractionTest: Story = {
  args: {
    children: (
      <>
        <h3>Test Card</h3>
        <p>Test content</p>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Test Card')).toBeInTheDocument();
    await expect(canvas.getByText('Test content')).toBeInTheDocument();
  },
};
