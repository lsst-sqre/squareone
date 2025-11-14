import type { Meta, StoryObj } from '@storybook/react-vite';
import { Eye, EyeOff, Mail, Search, User } from 'react-feather';
import { expect, userEvent, within } from 'storybook/test';
import TextInput from './TextInput';

const meta: Meta<typeof TextInput> = {
  title: 'Components/TextInput',
  component: TextInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the input',
    },
    appearance: {
      control: 'select',
      options: ['default', 'error', 'success'],
      description: 'Visual appearance state',
    },
    inputMode: {
      control: 'select',
      options: ['text', 'decimal', 'numeric', 'tel', 'search', 'email', 'url'],
      description: 'Input mode for mobile keyboards',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Makes input full width (incompatible with icons)',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the input',
    },
    required: {
      control: 'boolean',
      description: 'Marks input as required',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variations
export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Sample text content',
    placeholder: 'Enter text...',
  },
};

export const WithPlaceholder: Story = {
  args: {
    placeholder: 'Type something here...',
  },
};

// Size variations
export const Sizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextInput component in different sizes',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <TextInput size="sm" placeholder="Small input" />
      <TextInput size="md" placeholder="Medium input (default)" />
      <TextInput size="lg" placeholder="Large input" />
    </div>
  ),
};

// Appearance variations
export const Appearances: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextInput component with different appearance states',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <TextInput appearance="default" placeholder="Default appearance" />
      <TextInput appearance="error" placeholder="Error appearance" />
      <TextInput appearance="success" placeholder="Success appearance" />
    </div>
  ),
};

// Input types
export const InputTypes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextInput with different HTML input types and input modes',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <TextInput type="text" placeholder="Text input" />
      <TextInput type="email" placeholder="Email input" inputMode="email" />
      <TextInput type="tel" placeholder="Phone number" inputMode="tel" />
      <TextInput type="number" placeholder="Number input" inputMode="numeric" />
      <TextInput type="password" placeholder="Password input" />
      <TextInput type="search" placeholder="Search input" inputMode="search" />
      <TextInput type="url" placeholder="URL input" inputMode="url" />
    </div>
  ),
};

// With icons
export const WithIcons: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextInput with leading and trailing icons',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <TextInput leadingIcon={<User />} placeholder="Username" />
      <TextInput
        leadingIcon={<Mail />}
        placeholder="Email address"
        type="email"
      />
      <TextInput
        leadingIcon={<Search />}
        placeholder="Search..."
        type="search"
      />
      <TextInput
        trailingIcon={<Eye />}
        placeholder="Password"
        type="password"
      />
      <TextInput
        leadingIcon={<User />}
        trailingIcon={<EyeOff />}
        placeholder="Username with trailing icon"
      />
    </div>
  ),
};

// Icon sizes with different input sizes
export const IconSizes: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Icons scale appropriately with input sizes',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <TextInput
        size="sm"
        leadingIcon={<Search />}
        placeholder="Small with icon"
      />
      <TextInput
        size="md"
        leadingIcon={<Search />}
        placeholder="Medium with icon"
      />
      <TextInput
        size="lg"
        leadingIcon={<Search />}
        placeholder="Large with icon"
      />
    </div>
  ),
};

// Validation states
export const ValidationStates: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextInput with various validation states and ARIA attributes',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <TextInput
        required
        placeholder="Required field"
        aria-describedby="required-help"
      />
      <TextInput
        appearance="error"
        defaultValue="invalid@email"
        aria-invalid="true"
        aria-describedby="error-help"
      />
      <TextInput
        appearance="success"
        defaultValue="valid@email.com"
        type="email"
        aria-describedby="success-help"
      />
    </div>
  ),
};

// Disabled state
export const DisabledState: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextInput in disabled state',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <TextInput disabled placeholder="Disabled input" />
      <TextInput disabled defaultValue="Disabled with value" />
      <TextInput
        disabled
        leadingIcon={<User />}
        placeholder="Disabled with icon"
      />
    </div>
  ),
};

// Full width variant
export const FullWidth: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextInput that expands to full width of container',
      },
    },
  },
  render: () => (
    <div style={{ width: '100%', maxWidth: '600px' }}>
      <TextInput fullWidth placeholder="Full width input" />
    </div>
  ),
};

// Pattern validation
export const PatternValidation: Story = {
  parameters: {
    docs: {
      description: {
        story: 'TextInput with HTML5 validation patterns',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '300px',
      }}
    >
      <TextInput
        pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
        placeholder="123-456-7890"
        title="Phone number format: 123-456-7890"
      />
      <TextInput
        pattern="[A-Za-z]{3,}"
        placeholder="Minimum 3 letters"
        title="At least 3 letters"
      />
      <TextInput
        minLength={5}
        maxLength={10}
        placeholder="5-10 characters"
        title="Between 5 and 10 characters"
      />
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
    const input = canvas.getByPlaceholderText('Type here to test');

    // Test typing
    await userEvent.click(input);
    await userEvent.type(input, 'Hello World');

    // Verify the value
    await expect(input).toHaveValue('Hello World');
  },
};

// Interactive test - Focus behavior
export const FocusTest: Story = {
  args: {
    placeholder: 'Focus test input',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Focus test input');

    // Tab to focus the input
    await userEvent.tab();

    // Verify input is focused
    await expect(input).toHaveFocus();

    // Type something while focused
    await userEvent.type(input, 'Focused input');

    // Verify the value
    await expect(input).toHaveValue('Focused input');
  },
};

// Interactive test - Disabled behavior
export const DisabledInteractionTest: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Disabled input');

    // Verify input is disabled
    await expect(input).toBeDisabled();

    // Try to click and type (should not work)
    await userEvent.click(input);
    await userEvent.type(input, 'Should not appear');

    // Verify no value was entered
    await expect(input).toHaveValue('');
  },
};

// Interactive test - Error state
export const ErrorStateTest: Story = {
  args: {
    appearance: 'error',
    placeholder: 'Error state input',
    'aria-invalid': true,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('Error state input');

    // Verify aria-invalid is set
    await expect(input).toHaveAttribute('aria-invalid', 'true');

    // Input should still be functional
    await userEvent.click(input);
    await userEvent.type(input, 'Error corrected');

    await expect(input).toHaveValue('Error corrected');
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
    const input = canvas.getByPlaceholderText('Required field');

    // Verify required attribute
    await expect(input).toBeRequired();

    // Test that we can still type in it
    await userEvent.click(input);
    await userEvent.type(input, 'Required value');

    await expect(input).toHaveValue('Required value');
  },
};
