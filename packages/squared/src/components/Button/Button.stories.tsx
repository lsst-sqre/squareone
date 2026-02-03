import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowRight, ChevronRight, Download, Home, User } from 'lucide-react';
import { expect, userEvent, within } from 'storybook/test';
import Button from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    appearance: {
      control: 'select',
      options: ['solid', 'outline', 'text'],
      description: 'Visual style of the button',
    },
    tone: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'danger'],
      description: 'Semantic variation of the button',
    },
    variant: {
      control: 'select',
      options: [undefined, 'primary', 'secondary', 'danger'],
      description: 'Shorthand for common appearance + tone combinations',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
    block: {
      control: 'boolean',
      description: 'Makes button full width',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variations
export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Danger: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
  },
};

// Appearance variations
export const AppearanceVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button appearance="solid" tone="primary">
        Solid Primary
      </Button>
      <Button appearance="outline" tone="primary">
        Outline Primary
      </Button>
      <Button appearance="text" tone="primary">
        Text Primary
      </Button>
    </div>
  ),
};

// Tone variations
export const ToneVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button tone="primary">Primary</Button>
      <Button tone="secondary">Secondary</Button>
      <Button tone="tertiary">Tertiary</Button>
      <Button tone="danger">Danger</Button>
    </div>
  ),
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button leadingIcon={Home}>Home</Button>
      <Button trailingIcon={ChevronRight}>Next</Button>
      <Button leadingIcon={User} trailingIcon={ArrowRight}>
        Profile
      </Button>
      <Button appearance="outline" tone="secondary" leadingIcon={Download}>
        Download
      </Button>
    </div>
  ),
};

// Loading state
export const LoadingState: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button loading size="sm">
        Saving...
      </Button>
      <Button loading>Saving...</Button>
      <Button loading size="lg">
        Saving...
      </Button>
      <Button loading appearance="outline" tone="secondary">
        Processing...
      </Button>
    </div>
  ),
};

// Disabled state
export const DisabledState: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button disabled>Disabled Solid</Button>
      <Button disabled appearance="outline">
        Disabled Outline
      </Button>
      <Button disabled appearance="text">
        Disabled Text
      </Button>
    </div>
  ),
};

// Block buttons
export const BlockButtons: Story = {
  render: () => (
    <div
      style={{
        width: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <Button block>Full Width Primary</Button>
      <Button block appearance="outline" tone="secondary">
        Full Width Secondary
      </Button>
      <Button block appearance="text" tone="tertiary">
        Full Width Text
      </Button>
    </div>
  ),
};

// As link
export const AsLink: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button as="a" href="https://example.com" target="_blank">
        External Link
      </Button>
      <Button as="a" href="/docs" appearance="outline" tone="secondary">
        Documentation
      </Button>
    </div>
  ),
};

// BroadcastBanner style "Show more" button
export const BroadcastBannerStyle: Story = {
  args: {
    children: 'Show more',
    appearance: 'outline',
    tone: 'tertiary',
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story:
          'This demonstrates the "Show more" button style used in BroadcastBanner',
      },
    },
  },
};

// Complex composition
export const ComplexComposition: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBottom: '1rem' }}>All Solid Variations</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button appearance="solid" tone="primary">
            Primary
          </Button>
          <Button appearance="solid" tone="secondary">
            Secondary
          </Button>
          <Button appearance="solid" tone="tertiary">
            Tertiary
          </Button>
          <Button appearance="solid" tone="danger">
            Danger
          </Button>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>All Outline Variations</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button appearance="outline" tone="primary">
            Primary
          </Button>
          <Button appearance="outline" tone="secondary">
            Secondary
          </Button>
          <Button appearance="outline" tone="tertiary">
            Tertiary
          </Button>
          <Button appearance="outline" tone="danger">
            Danger
          </Button>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>All Text Variations</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Button appearance="text" tone="primary">
            Primary
          </Button>
          <Button appearance="text" tone="secondary">
            Secondary
          </Button>
          <Button appearance="text" tone="tertiary">
            Tertiary
          </Button>
          <Button appearance="text" tone="danger">
            Danger
          </Button>
        </div>
      </div>
    </div>
  ),
};

// Interactive test - Click behavior
export const ClickTest: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /click me/i });

    // Test that button is clickable
    await userEvent.click(button);

    // Verify button exists and is enabled
    await expect(button).toBeInTheDocument();
    await expect(button).not.toBeDisabled();
  },
};

// Interactive test - Disabled behavior
export const DisabledInteractionTest: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /disabled button/i });

    // Verify button is disabled
    await expect(button).toBeDisabled();

    // Try to click (should not trigger)
    await userEvent.click(button);

    // Button should still be disabled
    await expect(button).toBeDisabled();
  },
};

// Interactive test - Loading state
export const LoadingInteractionTest: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /loading button/i });

    // Verify button has loading state
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toBeDisabled();

    // Check for spinner
    const spinner = canvas.getByLabelText('Loading');
    await expect(spinner).toBeInTheDocument();
  },
};

// Interactive test - Focus behavior
export const FocusTest: Story = {
  args: {
    children: 'Focus me',
    variant: 'primary',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /focus me/i });

    // Tab to focus the button
    await userEvent.tab();

    // Verify button is focused
    await expect(button).toHaveFocus();

    // Press Enter while focused
    await userEvent.keyboard('{Enter}');

    // Button should still be in the document
    await expect(button).toBeInTheDocument();
  },
};
