import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { useState } from 'react';
import FormField from './FormField';

const meta: Meta<typeof FormField> = {
  title: 'Components/FormField',
  component: FormField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'text',
      description: 'Error message to display',
    },
    description: {
      control: 'text',
      description: 'Description text to display',
    },
    required: {
      control: 'boolean',
      description: 'Mark field as required',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic field with label and input
export const BasicField: Story = {
  render: () => (
    <FormField>
      <FormField.Label htmlFor="basic-input">Email Address</FormField.Label>
      <FormField.TextInput
        id="basic-input"
        type="email"
        placeholder="Enter your email"
      />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email Address');
    const label = canvas.getByText('Email Address');

    // Test that label is properly associated with input
    expect(label).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'email');
  },
};

// Field with error message
export const WithError: Story = {
  render: () => (
    <FormField error="Please enter a valid email address">
      <FormField.Label htmlFor="error-input">Email Address</FormField.Label>
      <FormField.TextInput
        id="error-input"
        type="email"
        placeholder="Enter your email"
        appearance="error"
      />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email Address');
    const errorMessage = canvas.getByText('Please enter a valid email address');

    // Test error state and ARIA attributes
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('role', 'status');
    expect(errorMessage).toHaveAttribute('aria-live', 'polite');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  },
};

// Field with description
export const WithDescription: Story = {
  render: () => (
    <FormField description="We'll use this to send you important updates">
      <FormField.Label htmlFor="desc-input">Email Address</FormField.Label>
      <FormField.TextInput
        id="desc-input"
        type="email"
        placeholder="Enter your email"
      />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Email Address');
    const description = canvas.getByText(
      "We'll use this to send you important updates"
    );

    // Test description association
    expect(description).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-describedby');
  },
};

// Required field
export const RequiredField: Story = {
  render: () => (
    <FormField required>
      <FormField.Label htmlFor="required-input">Full Name</FormField.Label>
      <FormField.TextInput
        id="required-input"
        placeholder="Enter your full name"
        required
      />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const label = canvas.getByText('Full Name');
    const requiredIndicator = canvas.getByText('*');
    const input = canvas.getByRole('textbox', { name: /full name/i });

    // Test required indicator
    expect(label).toBeInTheDocument();
    expect(requiredIndicator).toBeInTheDocument();
    expect(input).toHaveAttribute('required');
  },
};

// Complex field with all elements
export const ComplexField: Story = {
  render: () => (
    <FormField
      error="Username must be at least 3 characters"
      description="Choose a unique username that others will see"
      required
    >
      <FormField.Label htmlFor="complex-input">Username</FormField.Label>
      <FormField.TextInput
        id="complex-input"
        placeholder="Enter username"
        appearance="error"
        minLength={3}
        required
      />
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: /username/i });
    const description = canvas.getByText(
      'Choose a unique username that others will see'
    );
    const errorMessage = canvas.getByText(
      'Username must be at least 3 characters'
    );
    const requiredIndicator = canvas.getByText('*');

    // Test all elements are present and properly associated
    expect(input).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(errorMessage).toBeInTheDocument();
    expect(requiredIndicator).toBeInTheDocument();

    // Test ARIA associations
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
    expect(input).toHaveAttribute('required');
  },
};

// Interactive form example
export const InteractiveForm: Story = {
  render: () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setEmail(value);

      // Simple validation
      if (value && !value.includes('@')) {
        setError('Please enter a valid email address');
      } else {
        setError('');
      }
    };

    return (
      <form style={{ width: '300px' }}>
        <FormField error={error} description="We'll never share your email">
          <FormField.Label htmlFor="interactive-email">
            Email Address
          </FormField.Label>
          <FormField.TextInput
            id="interactive-email"
            type="email"
            value={email}
            onChange={handleChange}
            placeholder="Enter your email"
            appearance={error ? 'error' : 'default'}
          />
        </FormField>

        <FormField required>
          <FormField.Label htmlFor="interactive-name">
            Full Name
          </FormField.Label>
          <FormField.TextInput
            id="interactive-name"
            placeholder="Enter your full name"
            required
          />
        </FormField>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const emailInput = canvas.getByLabelText('Email Address');

    // Test interactive validation
    await userEvent.type(emailInput, 'invalid-email');

    // Wait for error message to appear
    const errorMessage = await canvas.findByText(
      'Please enter a valid email address'
    );
    expect(errorMessage).toBeInTheDocument();

    // Type a valid email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'user@example.com');

    // Error should be gone
    expect(
      canvas.queryByText('Please enter a valid email address')
    ).not.toBeInTheDocument();
  },
};

// Test layout stability when errors toggle
export const LayoutStability: Story = {
  render: () => {
    const [showError, setShowError] = useState(false);

    return (
      <div style={{ width: '300px' }}>
        <button
          type="button"
          onClick={() => setShowError(!showError)}
          style={{ marginBottom: '1rem' }}
        >
          Toggle Error
        </button>

        <FormField error={showError ? 'This field has an error' : undefined}>
          <FormField.Label htmlFor="stability-input">
            Test Field
          </FormField.Label>
          <FormField.TextInput
            id="stability-input"
            placeholder="Test input"
            appearance={showError ? 'error' : 'default'}
          />
        </FormField>

        <div style={{ padding: '1rem', background: '#f5f5f5' }}>
          Content below should not shift when error appears/disappears
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggleButton = canvas.getByText('Toggle Error');
    const contentBelow = canvas.getByText(
      'Content below should not shift when error appears/disappears'
    );

    // Get initial position
    const initialRect = contentBelow.getBoundingClientRect();

    // Toggle error on
    await userEvent.click(toggleButton);
    const errorMessage = await canvas.findByText('This field has an error');
    expect(errorMessage).toBeInTheDocument();

    // Check that content below didn't shift (much)
    const afterErrorRect = contentBelow.getBoundingClientRect();
    expect(Math.abs(afterErrorRect.top - initialRect.top)).toBeLessThan(5); // Allow for small variations

    // Toggle error off
    await userEvent.click(toggleButton);
    expect(
      canvas.queryByText('This field has an error')
    ).not.toBeInTheDocument();
  },
};
