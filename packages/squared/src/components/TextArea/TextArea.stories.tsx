import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import FormField from '../FormField';
import Label from '../Label';
import TextArea from './TextArea';

const meta: Meta<typeof TextArea> = {
  title: 'Components/TextArea',
  component: TextArea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the textarea',
    },
    appearance: {
      control: 'select',
      options: ['default', 'error', 'success'],
      description: 'Visual appearance state',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Makes textarea full width',
    },
    minRows: {
      control: 'number',
      description: 'Minimum number of rows',
    },
    maxRows: {
      control: 'number',
      description: 'Maximum number of rows (for autoResize)',
    },
    autoResize: {
      control: 'boolean',
      description: 'Automatically resize based on content',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the textarea',
    },
    required: {
      control: 'boolean',
      description: 'Marks textarea as required',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variations
export const Default: Story = {
  args: {
    placeholder: 'Enter your message...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue:
      'This is some initial content in the textarea that spans multiple lines.\n\nIt demonstrates how the component handles text content with line breaks.',
    placeholder: 'Enter your message...',
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder:
      'Please describe your issue in detail. Include any relevant information that might help us understand the problem.',
  },
};

// Size variations
export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextArea component in different sizes',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '400px',
      }}
    >
      <TextArea size="sm" placeholder="Small textarea" />
      <TextArea size="md" placeholder="Medium textarea (default)" />
      <TextArea size="lg" placeholder="Large textarea" />
    </div>
  ),
};

// Row count variations
export const RowCounts: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextArea with different row counts',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '400px',
      }}
    >
      <TextArea minRows={2} placeholder="2 rows minimum" />
      <TextArea minRows={3} placeholder="3 rows minimum (default)" />
      <TextArea minRows={5} placeholder="5 rows minimum" />
      <TextArea minRows={10} placeholder="10 rows minimum" />
    </div>
  ),
};

// Auto-resize functionality
export const AutoResize: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'TextArea with auto-resize functionality. Type content to see it grow.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(
      'Type here and watch the textarea grow...\n\n'
    );

    return (
      <div style={{ width: '400px' }}>
        <TextArea
          autoResize
          minRows={3}
          maxRows={8}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Auto-resizing textarea (3-8 rows)"
        />
        <p
          style={{
            marginTop: '1rem',
            fontSize: '0.875rem',
            color: 'var(--rsd-color-gray-600)',
          }}
        >
          Current content: {value.split('\n').length} lines
        </p>
      </div>
    );
  },
};

// Appearance variations
export const Appearances: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextArea component with different appearance states',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '400px',
      }}
    >
      <TextArea appearance="default" placeholder="Default appearance" />
      <TextArea appearance="error" placeholder="Error appearance" />
      <TextArea appearance="success" placeholder="Success appearance" />
    </div>
  ),
};

// Disabled state
export const DisabledState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextArea in disabled state',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '400px',
      }}
    >
      <TextArea disabled placeholder="Disabled textarea" />
      <TextArea disabled defaultValue="Disabled with content" />
    </div>
  ),
};

// Full width variant
export const FullWidth: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextArea that expands to full width of container',
      },
    },
  },
  render: () => (
    <div style={{ width: '100%', maxWidth: '600px' }}>
      <TextArea fullWidth placeholder="Full width textarea" />
    </div>
  ),
};

// Character counter example
export const CharacterCounter: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextArea with character counter and limit',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState('');
    const maxLength = 200;
    const remaining = maxLength - value.length;

    return (
      <div style={{ width: '400px' }}>
        <TextArea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={maxLength}
          placeholder="Type up to 200 characters..."
          appearance={remaining < 20 ? 'error' : 'default'}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0.5rem',
            fontSize: '0.875rem',
            color:
              remaining < 20
                ? 'var(--rsd-color-red-500)'
                : 'var(--rsd-color-gray-600)',
          }}
        >
          <span>
            {value.length} / {maxLength} characters
          </span>
          <span>{remaining} remaining</span>
        </div>
      </div>
    );
  },
};

// Validation states
export const ValidationStates: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextArea with various validation states and ARIA attributes',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        width: '400px',
      }}
    >
      <div>
        <Label htmlFor="required-textarea" required>
          Required Field
        </Label>
        <TextArea
          id="required-textarea"
          required
          placeholder="This field is required"
          aria-describedby="required-help"
        />
        <div
          id="required-help"
          style={{
            marginTop: '0.25rem',
            fontSize: '0.875rem',
            color: 'var(--rsd-color-gray-600)',
          }}
        >
          This field must be completed before submitting
        </div>
      </div>

      <div>
        <Label htmlFor="error-textarea">Error State</Label>
        <TextArea
          id="error-textarea"
          appearance="error"
          defaultValue="This content has an error"
          aria-invalid="true"
          aria-describedby="error-help"
        />
        <div
          id="error-help"
          role="status"
          aria-live="polite"
          style={{
            marginTop: '0.25rem',
            fontSize: '0.875rem',
            color: 'var(--rsd-color-red-500)',
          }}
        >
          Please enter valid content (minimum 10 characters)
        </div>
      </div>

      <div>
        <Label htmlFor="success-textarea">Success State</Label>
        <TextArea
          id="success-textarea"
          appearance="success"
          defaultValue="This content is valid and meets all requirements"
          aria-describedby="success-help"
        />
        <div
          id="success-help"
          style={{
            marginTop: '0.25rem',
            fontSize: '0.875rem',
            color: 'var(--rsd-color-green-600)',
          }}
        >
          Content is valid and ready for submission
        </div>
      </div>
    </div>
  ),
};

// Integration with FormField
export const WithFormField: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextArea integrated with FormField wrapper',
      },
    },
  },
  render: () => (
    <div style={{ width: '400px' }}>
      <FormField description="Please provide a detailed description">
        <FormField.Label htmlFor="message-field">Message</FormField.Label>
        <FormField.TextArea
          id="message-field"
          placeholder="Enter your message here..."
          minRows={4}
        />
      </FormField>
    </div>
  ),
};

// With error in FormField
export const WithFormFieldError: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextArea with FormField showing error state',
      },
    },
  },
  render: () => (
    <div style={{ width: '400px' }}>
      <FormField
        error="Message must be at least 10 characters long"
        description="Please provide a detailed description"
        required
      >
        <FormField.Label htmlFor="error-field">Message</FormField.Label>
        <FormField.TextArea
          id="error-field"
          placeholder="Enter your message here..."
          appearance="error"
          defaultValue="Too short"
          minRows={4}
        />
      </FormField>
    </div>
  ),
};

// Interactive test - Basic typing
export const TypingTest: Story = {
  args: {
    placeholder: 'Type here to test',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText('Type here to test');

    await userEvent.click(textarea);
    await userEvent.type(textarea, 'Hello World\nThis is a new line');

    await expect(textarea).toHaveValue('Hello World\nThis is a new line');
  },
};

// Interactive test - Auto-resize behavior
export const AutoResizeTest: Story = {
  args: {
    autoResize: true,
    minRows: 3,
    maxRows: 6,
    placeholder: 'Auto-resize test',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText('Auto-resize test');

    await userEvent.click(textarea);
    await userEvent.type(textarea, 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5');

    await expect(textarea).toHaveValue(
      'Line 1\nLine 2\nLine 3\nLine 4\nLine 5'
    );
    expect(textarea).toHaveAttribute('data-auto-resize', 'true');
  },
};

// Interactive test - Focus behavior
export const FocusTest: Story = {
  args: {
    placeholder: 'Focus test textarea',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText('Focus test textarea');

    await userEvent.tab();
    await expect(textarea).toHaveFocus();

    await userEvent.type(textarea, 'Focused content');
    await expect(textarea).toHaveValue('Focused content');
  },
};

// Interactive test - Disabled behavior
export const DisabledInteractionTest: Story = {
  args: {
    placeholder: 'Disabled textarea',
    disabled: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText('Disabled textarea');

    await expect(textarea).toBeDisabled();

    await userEvent.click(textarea);
    await userEvent.type(textarea, 'Should not appear');

    await expect(textarea).toHaveValue('');
  },
};

// Interactive test - Error state
export const ErrorStateTest: Story = {
  args: {
    appearance: 'error',
    placeholder: 'Error state textarea',
    'aria-invalid': true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText('Error state textarea');

    await expect(textarea).toHaveAttribute('aria-invalid', 'true');

    await userEvent.click(textarea);
    await userEvent.type(textarea, 'Error corrected');

    await expect(textarea).toHaveValue('Error corrected');
  },
};

// Interactive test - Required field
export const RequiredFieldTest: Story = {
  args: {
    placeholder: 'Required field',
    required: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByPlaceholderText('Required field');

    await expect(textarea).toBeRequired();

    await userEvent.click(textarea);
    await userEvent.type(textarea, 'Required content');

    await expect(textarea).toHaveValue('Required content');
  },
};

// React Hook Form Integration Example
export const ReactHookFormIntegration: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Complete form example with react-hook-form integration',
      },
    },
  },
  render: () => {
    type FormData = {
      subject: string;
      message: string;
      category: string;
    };

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting, isSubmitSuccessful },
      reset,
      watch,
    } = useForm<FormData>({
      mode: 'onBlur',
    });

    const [submitMessage, setSubmitMessage] = useState<string>('');
    const messageValue = watch('message', '');

    const onSubmit = async (data: FormData) => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSubmitMessage(
          `Success! Form submitted:\n\nSubject: ${data.subject}\nCategory: ${data.category}\nMessage: ${data.message}`
        );

        setTimeout(() => {
          reset();
          setSubmitMessage('');
        }, 4000);
      } catch (error) {
        setSubmitMessage('Submission failed. Please try again.');
      }
    };

    return (
      <div style={{ width: '500px', padding: '2rem' }}>
        <h3
          style={{
            marginBottom: '1.5rem',
            color: 'var(--rsd-component-text-color)',
          }}
        >
          Contact Form
        </h3>

        {submitMessage && (
          <div
            style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              borderRadius: 'var(--sqo-border-radius-1)',
              backgroundColor: isSubmitSuccessful
                ? 'var(--rsd-color-green-100)'
                : 'var(--rsd-color-red-100)',
              color: isSubmitSuccessful
                ? 'var(--rsd-color-green-800)'
                : 'var(--rsd-color-red-800)',
              fontSize: '0.875rem',
              whiteSpace: 'pre-line',
            }}
            role="alert"
          >
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField
            error={errors.subject?.message}
            required
            style={{ marginBottom: '1.5rem' }}
          >
            <FormField.Label htmlFor="rhf-subject">Subject</FormField.Label>
            <FormField.TextInput
              id="rhf-subject"
              placeholder="Brief subject line"
              appearance={errors.subject ? 'error' : 'default'}
              {...register('subject', {
                required: 'Subject is required',
                minLength: {
                  value: 5,
                  message: 'Subject must be at least 5 characters',
                },
              })}
            />
          </FormField>

          <FormField
            error={errors.message?.message}
            description={`${messageValue.length}/500 characters`}
            required
            style={{ marginBottom: '1.5rem' }}
          >
            <FormField.Label htmlFor="rhf-message">Message</FormField.Label>
            <FormField.TextArea
              id="rhf-message"
              placeholder="Please describe your inquiry in detail..."
              appearance={errors.message ? 'error' : 'default'}
              minRows={5}
              maxRows={10}
              autoResize
              {...register('message', {
                required: 'Message is required',
                minLength: {
                  value: 20,
                  message: 'Message must be at least 20 characters',
                },
                maxLength: {
                  value: 500,
                  message: 'Message cannot exceed 500 characters',
                },
              })}
            />
          </FormField>

          <div style={{ textAlign: 'center' }}>
            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ minWidth: '120px' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </form>
      </div>
    );
  },
};
