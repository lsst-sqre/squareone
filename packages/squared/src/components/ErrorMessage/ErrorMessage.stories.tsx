import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import ErrorMessage from './ErrorMessage';

const meta: Meta<typeof ErrorMessage> = {
  title: 'Components/ErrorMessage',
  component: ErrorMessage,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'This field is required',
  },
};

export const Empty: Story = {
  args: {
    message: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          'When no message is provided, space is reserved to prevent layout shift.',
      },
    },
  },
};

export const DynamicStrategy: Story = {
  args: {
    message: undefined,
    strategy: 'dynamic',
  },
  parameters: {
    docs: {
      description: {
        story:
          'With dynamic strategy, the component renders nothing when there is no message.',
      },
    },
  },
};

export const WithMessage: Story = {
  args: {
    message: 'Please enter a valid email address',
  },
};

export const LongMessage: Story = {
  args: {
    message:
      'This is a very long error message that demonstrates how the component handles longer text content that may wrap to multiple lines in the interface.',
  },
};

export const Interactive: Story = {
  render: () => {
    const [hasError, setHasError] = useState(false);
    const [message, setMessage] = useState('');

    const toggleError = () => {
      if (hasError) {
        setHasError(false);
        setMessage('');
      } else {
        setHasError(true);
        setMessage('This field is required');
      }
    };

    return (
      <div style={{ padding: '1rem' }}>
        <button
          onClick={toggleError}
          style={{
            padding: '0.5rem 1rem',
            marginBottom: '1rem',
            background: '#007acc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {hasError ? 'Clear Error' : 'Show Error'}
        </button>
        <div style={{ border: '1px dashed #ccc', padding: '1rem' }}>
          <ErrorMessage id="interactive-error" message={message} />
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          Click the button to toggle the error message and observe layout
          stability.
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo showing how the error message appears and disappears while maintaining layout stability.',
      },
    },
  },
  tags: ['test'],
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: /show error/i });

    // Initially no error should be visible (using ID since placeholder doesn't have role="status")
    const errorContainer = document.getElementById('interactive-error');
    expect(errorContainer).toBeInTheDocument();
    expect(errorContainer).toHaveAttribute('aria-hidden', 'true');

    // Click to show error
    await userEvent.click(button);

    // Error message should now be visible
    const errorMessage = canvas.getByText('This field is required');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('role', 'status');
    expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    expect(errorMessage).toHaveAttribute('aria-atomic', 'true');

    // Click to hide error
    await userEvent.click(canvas.getByRole('button', { name: /clear error/i }));

    // Error should be hidden but space reserved
    expect(
      canvas.queryByText('This field is required')
    ).not.toBeInTheDocument();
  },
};

export const ScreenReaderTest: Story = {
  render: () => (
    <div>
      <h3>Screen Reader Announcement Test</h3>
      <p>
        This story tests proper ARIA attributes for screen reader announcements.
      </p>
      <ErrorMessage
        id="sr-test-error"
        message="Username is already taken"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tests proper ARIA attributes for screen reader announcements.',
      },
    },
  },
  tags: ['test'],
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const errorMessage = canvas.getByText('Username is already taken');

    // Check ARIA attributes
    expect(errorMessage).toHaveAttribute('role', 'status');
    expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    expect(errorMessage).toHaveAttribute('aria-atomic', 'true');
    expect(errorMessage).toHaveAttribute('id', 'sr-test-error');
  },
};
