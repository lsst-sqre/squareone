import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect, waitFor } from 'storybook/test';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import FormField from './FormField';
import { Button } from '../Button';

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

// React Hook Form Integration Example
export const ReactHookFormIntegration: Story = {
  render: () => {
    type FormData = {
      email: string;
      username: string;
      password: string;
      fullName: string;
      phone?: string;
    };

    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting, isSubmitSuccessful },
      reset,
    } = useForm<FormData>({
      mode: 'onBlur', // Validate on blur for better UX
    });

    const [submitMessage, setSubmitMessage] = useState<string>('');

    const onSubmit = async (data: FormData) => {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSubmitMessage(
          `Success! Welcome ${data.fullName}. Form data: ${JSON.stringify(
            data,
            null,
            2
          )}`
        );

        // Reset form after successful submission
        setTimeout(() => {
          reset();
          setSubmitMessage('');
        }, 3000);
      } catch (error) {
        setSubmitMessage('Submission failed. Please try again.');
      }
    };

    return (
      <div style={{ width: '400px', padding: '2rem' }}>
        <h3
          style={{
            marginBottom: '1.5rem',
            color: 'var(--rsd-component-text-color)',
          }}
        >
          User Registration Form
        </h3>

        {submitMessage && (
          <div
            style={{
              padding: '1rem',
              marginBottom: '1.5rem',
              borderRadius: 'var(--sqo-border-radius-1)',
              backgroundColor: isSubmitSuccessful
                ? 'var(--rsd-color-green-500)'
                : 'var(--rsd-color-red-500)',
              color: 'white',
              fontSize: '0.875rem',
            }}
            role="alert"
          >
            {submitMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email Field */}
          <FormField
            error={errors.email?.message}
            description="We'll use this for account verification"
            required
          >
            <FormField.Label htmlFor="rhf-email">Email Address</FormField.Label>
            <FormField.TextInput
              id="rhf-email"
              type="email"
              placeholder="Enter your email"
              appearance={errors.email ? 'error' : 'default'}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              })}
            />
          </FormField>

          {/* Username Field */}
          <FormField
            error={errors.username?.message}
            description="Choose a unique username (letters, numbers, and underscores only)"
            required
          >
            <FormField.Label htmlFor="rhf-username">Username</FormField.Label>
            <FormField.TextInput
              id="rhf-username"
              placeholder="Enter username"
              appearance={errors.username ? 'error' : 'default'}
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters',
                },
                maxLength: {
                  value: 20,
                  message: 'Username must be no more than 20 characters',
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message:
                    'Username can only contain letters, numbers, and underscores',
                },
              })}
            />
          </FormField>

          {/* Password Field */}
          <FormField
            error={errors.password?.message}
            description="Must be at least 8 characters with letters and numbers"
            required
          >
            <FormField.Label htmlFor="rhf-password">Password</FormField.Label>
            <FormField.TextInput
              id="rhf-password"
              type="password"
              placeholder="Enter password"
              appearance={errors.password ? 'error' : 'default'}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)/,
                  message: 'Password must contain both letters and numbers',
                },
              })}
            />
          </FormField>

          {/* Full Name Field */}
          <FormField error={errors.fullName?.message} required>
            <FormField.Label htmlFor="rhf-fullName">Full Name</FormField.Label>
            <FormField.TextInput
              id="rhf-fullName"
              placeholder="Enter your full name"
              appearance={errors.fullName ? 'error' : 'default'}
              {...register('fullName', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Full name must be at least 2 characters',
                },
              })}
            />
          </FormField>

          {/* Phone Field (Optional) */}
          <FormField
            error={errors.phone?.message}
            description="Optional - for account recovery (US format: xxx-xxx-xxxx)"
          >
            <FormField.Label htmlFor="rhf-phone">Phone Number</FormField.Label>
            <FormField.TextInput
              id="rhf-phone"
              type="tel"
              placeholder="123-456-7890"
              inputMode="tel"
              appearance={errors.phone ? 'error' : 'default'}
              {...register('phone', {
                pattern: {
                  value: /^\d{3}-\d{3}-\d{4}$/,
                  message: 'Phone number must be in format: xxx-xxx-xxxx',
                },
              })}
            />
          </FormField>

          {/* Submit Button */}
          <div style={{ marginTop: '1.5rem' }}>
            <Button
              type="submit"
              disabled={isSubmitting}
              block
              role="primary"
              size="md"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>

        {/* Documentation Comment */}
        <div
          style={{
            marginTop: '2rem',
            padding: '1rem',
            backgroundColor: 'var(--rsd-color-primary-100)',
            borderRadius: 'var(--sqo-border-radius-1)',
            fontSize: '0.875rem',
            color: 'var(--rsd-component-text-color)',
          }}
        >
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>
            Integration Notes:
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>
              Components work seamlessly with react-hook-form's{' '}
              <code>register()</code> function
            </li>
            <li>
              Error messages from validation rules are automatically passed to
              FormField
            </li>
            <li>ARIA attributes are automatically applied for accessibility</li>
            <li>Form validates on blur for better user experience</li>
            <li>Success and error states are visually distinct</li>
          </ul>
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: `
This story demonstrates a complete integration with react-hook-form, showcasing:

- **Registration**: Each FormField.TextInput uses \`{...register()}\` for automatic form handling
- **Validation**: Complex validation rules with custom error messages
- **Error Display**: Validation errors automatically flow to FormField's error prop
- **Accessibility**: ARIA attributes are automatically applied based on error state
- **User Experience**: Form validates on blur, provides clear feedback, and shows success states

The FormField components are designed to work with any form library while maintaining clean, accessible markup.
        `,
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test initial state - no errors should be visible
    expect(canvas.queryByText('Email is required')).not.toBeInTheDocument();
    expect(canvas.queryByText('Username is required')).not.toBeInTheDocument();
    expect(canvas.queryByText('Password is required')).not.toBeInTheDocument();

    // Get form elements
    const emailInput = canvas.getByLabelText(/email address/i);
    const usernameInput = canvas.getByLabelText(/username/i);
    const passwordInput = canvas.getByLabelText(/password/i);
    const fullNameInput = canvas.getByLabelText(/full name/i);
    const phoneInput = canvas.getByLabelText(/phone number/i);
    const submitButton = canvas.getByRole('button', {
      name: /create account/i,
    });

    // Test validation on blur - enter invalid email and blur
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.tab(); // Blur the email field

    // Wait for validation error to appear
    const emailError = await canvas.findByText(
      'Please enter a valid email address'
    );
    expect(emailError).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    expect(emailInput).toHaveAttribute('aria-describedby');

    // Test username validation - too short
    await userEvent.type(usernameInput, 'ab');
    await userEvent.tab();

    const usernameError = await canvas.findByText(
      'Username must be at least 3 characters'
    );
    expect(usernameError).toBeInTheDocument();

    // Test password validation - no numbers
    await userEvent.type(passwordInput, 'password');
    await userEvent.tab();

    const passwordError = await canvas.findByText(
      'Password must contain both letters and numbers'
    );
    expect(passwordError).toBeInTheDocument();

    // Test phone number validation - invalid format
    await userEvent.type(phoneInput, '1234567890');
    await userEvent.tab();

    const phoneError = await canvas.findByText(
      'Phone number must be in format: xxx-xxx-xxxx'
    );
    expect(phoneError).toBeInTheDocument();

    // Try to submit with errors - should not submit
    await userEvent.click(submitButton);

    // Required field errors should appear for empty fields
    const fullNameError = await canvas.findByText('Full name is required');
    expect(fullNameError).toBeInTheDocument();

    // Now correct all the errors
    // Fix email
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.tab();

    // Fix username
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, 'testuser123');
    await userEvent.tab();

    // Fix password
    await userEvent.clear(passwordInput);
    await userEvent.type(passwordInput, 'password123');
    await userEvent.tab();

    // Add full name
    await userEvent.type(fullNameInput, 'John Doe');
    await userEvent.tab();

    // Fix phone number
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, '123-456-7890');
    await userEvent.tab();

    // Wait for errors to disappear
    await waitFor(() => {
      expect(
        canvas.queryByText('Please enter a valid email address')
      ).not.toBeInTheDocument();
    });
    expect(
      canvas.queryByText('Username must be at least 3 characters')
    ).not.toBeInTheDocument();
    expect(
      canvas.queryByText('Password must contain both letters and numbers')
    ).not.toBeInTheDocument();
    expect(canvas.queryByText('Full name is required')).not.toBeInTheDocument();
    expect(
      canvas.queryByText('Phone number must be in format: xxx-xxx-xxxx')
    ).not.toBeInTheDocument();

    // Verify ARIA attributes are updated (should be false/removed when no errors)
    // React removes boolean attributes when they're false, so check they're not "true"
    expect(emailInput).not.toHaveAttribute('aria-invalid', 'true');
    expect(usernameInput).not.toHaveAttribute('aria-invalid', 'true');
    expect(passwordInput).not.toHaveAttribute('aria-invalid', 'true');

    // Submit the valid form
    await userEvent.click(submitButton);

    // Verify button changes to loading state
    expect(canvas.getByText('Creating Account...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Wait for success message
    const successMessage = await canvas.findByText(/Success! Welcome John Doe/);
    expect(successMessage).toBeInTheDocument();
    expect(successMessage).toHaveAttribute('role', 'alert');

    // Verify form resets after success (wait up to 4 seconds)
    await waitFor(
      () => {
        expect(
          canvas.queryByText(/Success! Welcome John Doe/)
        ).not.toBeInTheDocument();
      },
      { timeout: 4000 }
    );

    // Verify form fields are cleared
    expect(emailInput).toHaveValue('');
    expect(usernameInput).toHaveValue('');
    expect(passwordInput).toHaveValue('');
    expect(fullNameInput).toHaveValue('');
    expect(phoneInput).toHaveValue('');
  },
};
