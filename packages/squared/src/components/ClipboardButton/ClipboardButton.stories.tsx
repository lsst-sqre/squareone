import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import ClipboardButton from './ClipboardButton';

const meta: Meta<typeof ClipboardButton> = {
  title: 'Components/ClipboardButton',
  component: ClipboardButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: 'The text to copy to clipboard',
    },
    label: {
      control: 'text',
      description: 'Label to display on the button',
    },
    successLabel: {
      control: 'text',
      description: 'Label to display after successful copy',
    },
    successDuration: {
      control: 'number',
      description: 'Duration in milliseconds to show success state',
    },
    showIcon: {
      control: 'boolean',
      description: 'Whether to show the clipboard icon',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
    },
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Sample text to copy',
  },
};

export const WithCustomLabels: Story = {
  args: {
    text: 'Custom labeled text',
    label: 'Copy Code',
    successLabel: 'Code Copied!',
  },
};

export const DynamicText: Story = {
  args: {
    text: () => `Generated at ${new Date().toISOString()}`,
    label: 'Copy Timestamp',
  },
};

export const ButtonVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <ClipboardButton text="Primary" />
      <ClipboardButton text="Secondary" />
      <ClipboardButton
        text="Outline Primary"
        appearance="outline"
        tone="primary"
      />
      <ClipboardButton text="Text Primary" appearance="text" tone="primary" />
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <ClipboardButton text="Small" size="sm" />
      <ClipboardButton text="Medium" size="md" />
      <ClipboardButton text="Large" size="lg" />
    </div>
  ),
};

export const WithoutIcon: Story = {
  args: {
    text: 'Some text',
    label: 'Copy to Clipboard',
    showIcon: false,
    appearance: 'text',
  },
};

export const CustomSuccessDuration: Story = {
  args: {
    text: 'Quick success message',
    label: 'Copy',
    successLabel: 'Copied!',
    successDuration: 2000,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Success message disappears after 2 seconds instead of the default 10 seconds',
      },
    },
  },
};

export const DisabledState: Story = {
  args: {
    text: 'Cannot copy this',
    disabled: true,
  },
};

export const TokenCopyExample: Story = {
  args: {
    text: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    label: 'Copy Token',
    successLabel: 'Token Copied!',
    successDuration: 5000,
    variant: 'primary',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example usage for copying authentication tokens',
      },
    },
  },
};

export const TemplateUrlExample: Story = {
  args: {
    text: 'https://example.com/template?param1=value1&param2=value2',
    label: 'Copy Template URL',
    successLabel: 'Template URL Copied!',
    appearance: 'outline',
    tone: 'secondary',
    size: 'sm',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example usage for copying template URLs',
      },
    },
  },
};

export const ClickTest: Story = {
  args: {
    text: 'Test copy text',
    label: 'Copy',
    successLabel: 'Copied!',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole('button', { name: /copy to clipboard/i });
    await expect(button).toBeInTheDocument();
  },
};

export const DisabledInteractionTest: Story = {
  args: {
    text: 'Disabled copy',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    await expect(button).toBeDisabled();

    await userEvent.click(button);

    await expect(button).toBeDisabled();
  },
};

export const DynamicTextTest: Story = {
  args: {
    text: () => `Dynamic text ${Math.random().toString(36).substring(7)}`,
    label: 'Copy Dynamic',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', {
      name: /copy dynamic to clipboard/i,
    });
    await expect(button).toBeInTheDocument();
  },
};
