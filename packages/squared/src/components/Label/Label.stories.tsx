import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import Label from './Label';

const meta: Meta<typeof Label> = {
  title: 'Components/Label',
  component: Label,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Email Address',
  },
};

export const Required: Story = {
  args: {
    required: true,
    children: 'Email Address',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Label with required indicator (red asterisk) and proper ARIA labeling.',
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Email Address',
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled label with reduced opacity.',
      },
    },
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Label size="sm">Small Label</Label>
      <Label size="md">Medium Label (Default)</Label>
      <Label size="lg">Large Label</Label>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Different label sizes to match form input variants.',
      },
    },
  },
};

export const WithFormControl: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Label htmlFor="email-input" required>
        Email Address
      </Label>
      <input
        id="email-input"
        type="email"
        placeholder="Enter your email"
        style={{
          padding: '0.5rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          fontSize: '1rem',
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Label properly associated with a form control using htmlFor attribute.',
      },
    },
  },
  tags: ['test'],
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Email Address');
    const input = canvas.getByRole('textbox');

    // Test that clicking the label focuses the input
    await userEvent.click(label);
    expect(input).toHaveFocus();
  },
};

export const AllVariations: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        padding: '1rem',
      }}
    >
      <div>
        <h3
          style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 'bold' }}
        >
          Default
        </h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <Label size="sm">Small</Label>
          <Label size="md">Medium</Label>
          <Label size="lg">Large</Label>
        </div>
      </div>

      <div>
        <h3
          style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 'bold' }}
        >
          Required
        </h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <Label size="sm" required>
            Small Required
          </Label>
          <Label size="md" required>
            Medium Required
          </Label>
          <Label size="lg" required>
            Large Required
          </Label>
        </div>
      </div>

      <div>
        <h3
          style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 'bold' }}
        >
          Disabled
        </h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <Label size="sm" disabled>
            Small Disabled
          </Label>
          <Label size="md" disabled>
            Medium Disabled
          </Label>
          <Label size="lg" disabled>
            Large Disabled
          </Label>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Comprehensive overview of all label variations and combinations.',
      },
    },
  },
};

export const AccessibilityTest: Story = {
  render: () => (
    <div>
      <h3>Accessibility Features Test</h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '300px',
        }}
      >
        <div>
          <Label htmlFor="test-input-1" required>
            Username
          </Label>
          <input
            id="test-input-1"
            type="text"
            placeholder="Enter username"
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <Label htmlFor="test-input-2">Optional Field</Label>
          <input
            id="test-input-2"
            type="text"
            placeholder="Optional input"
            style={{
              padding: '0.5rem',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '100%',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Tests proper label-input association and required indicator accessibility.',
      },
    },
  },
  tags: ['test'],
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Test required indicator is present (visual only, hidden from screen readers)
    const requiredIndicator = canvas.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveAttribute('aria-hidden', 'true');

    // Test label-input associations
    const usernameLabel = canvas.getByText('Username');
    const usernameInput = canvas.getByPlaceholderText('Enter username');

    // Click label should focus input
    await userEvent.click(usernameLabel);
    expect(usernameInput).toHaveFocus();

    // Test non-required label
    const optionalLabel = canvas.getByText('Optional Field');
    const optionalInput = canvas.getByPlaceholderText('Optional input');

    await userEvent.click(optionalLabel);
    expect(optionalInput).toHaveFocus();
  },
};
