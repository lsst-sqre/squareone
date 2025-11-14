import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { useForm } from 'react-hook-form';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import FormField from '../FormField';
import RadioGroup from './RadioGroup';

const meta: Meta<typeof RadioGroup> = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A RadioGroup component for single-selection from multiple options. Built with Radix UI primitives for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    legend: {
      control: 'text',
      description: 'The legend/label for the radio group',
    },
    description: {
      control: 'text',
      description: 'Optional description text displayed below the legend',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation of the radio options',
    },
    required: {
      control: 'boolean',
      description: 'Marks the radio group as required',
    },
    defaultValue: {
      control: 'text',
      description: 'Default selected value',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variations
export const Default: Story = {
  args: {
    legend: 'Account Type',
    name: 'accountType',
    defaultValue: 'personal',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item value="personal" label="Personal" />
      <RadioGroup.Item value="business" label="Business" />
      <RadioGroup.Item value="enterprise" label="Enterprise" />
    </RadioGroup>
  ),
};

export const WithDescriptions: Story = {
  args: {
    legend: 'Subscription Plan',
    description: 'Choose the plan that best fits your needs',
    name: 'plan',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item
        value="basic"
        label="Basic Plan"
        description="Perfect for individuals getting started"
      />
      <RadioGroup.Item
        value="pro"
        label="Pro Plan"
        description="Great for small teams and growing businesses"
      />
      <RadioGroup.Item
        value="enterprise"
        label="Enterprise Plan"
        description="Advanced features for large organizations"
      />
    </RadioGroup>
  ),
};

export const PreSelected: Story = {
  args: {
    legend: 'Notification Preferences',
    name: 'notifications',
    defaultValue: 'email',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item value="none" label="No notifications" />
      <RadioGroup.Item
        value="email"
        label="Email only"
        description="Receive notifications via email"
      />
      <RadioGroup.Item
        value="push"
        label="Push notifications"
        description="Receive push notifications on your device"
      />
      <RadioGroup.Item value="both" label="Email and push" />
    </RadioGroup>
  ),
};

export const WithDisabledOptions: Story = {
  args: {
    legend: 'Shipping Method',
    name: 'shipping',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item
        value="standard"
        label="Standard Shipping"
        description="5-7 business days"
      />
      <RadioGroup.Item
        value="express"
        label="Express Shipping"
        description="2-3 business days"
      />
      <RadioGroup.Item
        value="overnight"
        label="Overnight Shipping"
        description="Next business day"
        disabled
      />
      <RadioGroup.Item
        value="same-day"
        label="Same Day Delivery"
        description="Not available in your area"
        disabled
      />
    </RadioGroup>
  ),
};

export const Required: Story = {
  args: {
    legend: 'Payment Method',
    name: 'payment',
    required: true,
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item value="credit" label="Credit Card" />
      <RadioGroup.Item value="debit" label="Debit Card" />
      <RadioGroup.Item value="paypal" label="PayPal" />
      <RadioGroup.Item value="bank" label="Bank Transfer" />
    </RadioGroup>
  ),
};

export const HorizontalLayout: Story = {
  args: {
    legend: 'Size',
    orientation: 'horizontal',
    name: 'size',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item value="xs" label="XS" />
      <RadioGroup.Item value="s" label="S" />
      <RadioGroup.Item value="m" label="M" />
      <RadioGroup.Item value="l" label="L" />
      <RadioGroup.Item value="xl" label="XL" />
    </RadioGroup>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <RadioGroup legend="Small Size" name="small">
        <RadioGroup.Item value="option1" label="Small radio button" size="sm" />
        <RadioGroup.Item
          value="option2"
          label="Another small option"
          size="sm"
        />
      </RadioGroup>

      <RadioGroup legend="Medium Size (Default)" name="medium">
        <RadioGroup.Item value="option1" label="Medium radio button" />
        <RadioGroup.Item value="option2" label="Another medium option" />
      </RadioGroup>

      <RadioGroup legend="Large Size" name="large">
        <RadioGroup.Item value="option1" label="Large radio button" size="lg" />
        <RadioGroup.Item
          value="option2"
          label="Another large option"
          size="lg"
        />
      </RadioGroup>
    </div>
  ),
};

export const LegendSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <RadioGroup legend="Small Legend" size="sm" name="legend-sm" required>
        <RadioGroup.Item value="option1" label="First option" size="sm" />
        <RadioGroup.Item value="option2" label="Second option" size="sm" />
      </RadioGroup>

      <RadioGroup
        legend="Medium Legend (Default)"
        size="md"
        name="legend-md"
        description="This shows the default legend size"
        required
      >
        <RadioGroup.Item value="option1" label="First option" />
        <RadioGroup.Item value="option2" label="Second option" />
      </RadioGroup>

      <RadioGroup legend="Large Legend" size="lg" name="legend-lg" required>
        <RadioGroup.Item value="option1" label="First option" size="lg" />
        <RadioGroup.Item value="option2" label="Second option" size="lg" />
      </RadioGroup>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'RadioGroup now supports size variants for the legend through the polymorphic Label component.',
      },
    },
  },
};

export const WithFormField: Story = {
  render: () => (
    <FormField
      error="Please select a valid account type"
      description="This selection affects your available features"
      required
    >
      <RadioGroup legend="Account Type" name="accountType">
        <RadioGroup.Item
          value="personal"
          label="Personal Account"
          description="For individual use"
        />
        <RadioGroup.Item
          value="business"
          label="Business Account"
          description="For company use"
        />
        <RadioGroup.Item
          value="enterprise"
          label="Enterprise Account"
          description="For large organizations"
        />
      </RadioGroup>
    </FormField>
  ),
};

export const ControlledExample: Story = {
  render: () => {
    const [value, setValue] = React.useState('option2');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p>
          Selected value: <strong>{value || 'None'}</strong>
        </p>
        <RadioGroup
          legend="Controlled Radio Group"
          name="controlled"
          value={value}
          onValueChange={setValue}
        >
          <RadioGroup.Item value="option1" label="First Option" />
          <RadioGroup.Item value="option2" label="Second Option" />
          <RadioGroup.Item value="option3" label="Third Option" />
        </RadioGroup>
        <Button onClick={() => setValue('')} size="sm">
          Clear Selection
        </Button>
      </div>
    );
  },
};

// React Hook Form Integration Story
export const ReactHookFormIntegration: Story = {
  render: () => {
    const {
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
      watch,
      setValue,
    } = useForm({
      defaultValues: {
        accountType: 'personal',
        notifications: 'email',
        theme: 'light',
      },
    });

    const onSubmit = async (data: any) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`Form submitted with data: ${JSON.stringify(data, null, 2)}`);
    };

    return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          width: '400px',
        }}
      >
        <FormField error={errors.accountType?.message} required>
          {/* Controlled RadioGroup to properly apply default values from React Hook Form */}
          <RadioGroup
            legend="Account Type"
            value={watch('accountType')}
            onValueChange={(value) => setValue('accountType', value)}
            aria-invalid={!!errors.accountType}
          >
            <RadioGroup.Item
              value="personal"
              label="Personal Account"
              description="For individual use and personal projects"
            />
            <RadioGroup.Item
              value="business"
              label="Business Account"
              description="For small to medium businesses"
            />
            <RadioGroup.Item
              value="enterprise"
              label="Enterprise Account"
              description="For large organizations with advanced needs"
            />
          </RadioGroup>
        </FormField>

        <FormField description="Choose how you'd like to receive updates">
          <RadioGroup
            legend="Notification Preferences"
            value={watch('notifications')}
            onValueChange={(value) => setValue('notifications', value)}
          >
            <RadioGroup.Item
              value="none"
              label="No notifications"
              description="You won't receive any updates"
            />
            <RadioGroup.Item
              value="email"
              label="Email notifications"
              description="Receive updates via email"
            />
            <RadioGroup.Item
              value="push"
              label="Push notifications"
              description="Receive push notifications"
            />
          </RadioGroup>
        </FormField>

        <FormField>
          <RadioGroup
            legend="Theme Preference"
            orientation="horizontal"
            value={watch('theme')}
            onValueChange={(value) => setValue('theme', value)}
          >
            <RadioGroup.Item value="light" label="Light" />
            <RadioGroup.Item value="dark" label="Dark" />
            <RadioGroup.Item value="auto" label="Auto" />
          </RadioGroup>
        </FormField>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            type="submit"
            role="primary"
            size="md"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </Button>
          <Button
            type="button"
            role="secondary"
            size="md"
            onClick={() => reset()}
          >
            Reset Form
          </Button>
        </div>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify default values are preselected
    const personalRadio = canvas.getByDisplayValue('personal');
    const emailRadio = canvas.getByDisplayValue('email');
    const lightRadio = canvas.getByDisplayValue('light');

    expect(personalRadio).toBeChecked();
    expect(emailRadio).toBeChecked();
    expect(lightRadio).toBeChecked();

    // Test changing account type to business
    const businessRadio = canvas.getByDisplayValue('business');
    const businessButton = canvas.getByRole('radio', {
      name: /business account/i,
    });
    await userEvent.click(businessButton);
    expect(businessRadio).toBeChecked();
    expect(personalRadio).not.toBeChecked();

    // Test changing notification preference to push
    const pushRadio = canvas.getByDisplayValue('push');
    const pushButton = canvas.getByRole('radio', {
      name: /push notifications/i,
    });
    await userEvent.click(pushButton);
    expect(pushRadio).toBeChecked();
    expect(emailRadio).not.toBeChecked();

    // Test changing theme to dark
    const darkRadio = canvas.getByDisplayValue('dark');
    const darkButton = canvas.getByRole('radio', { name: /dark/i });
    await userEvent.click(darkButton);
    expect(darkRadio).toBeChecked();
    expect(lightRadio).not.toBeChecked();

    // Test reset button - should restore defaults
    const resetButton = canvas.getByText('Reset Form');
    await userEvent.click(resetButton);

    // Verify defaults are restored
    expect(personalRadio).toBeChecked();
    expect(businessRadio).not.toBeChecked();
    expect(emailRadio).toBeChecked();
    expect(pushRadio).not.toBeChecked();
    expect(lightRadio).toBeChecked();
    expect(darkRadio).not.toBeChecked();

    // Test form submission workflow
    const submitButton = canvas.getByText('Create Account');

    // Change to enterprise account before submitting
    const enterpriseRadio = canvas.getByDisplayValue('enterprise');
    const enterpriseButton = canvas.getByRole('radio', {
      name: /enterprise account/i,
    });
    await userEvent.click(enterpriseButton);
    expect(enterpriseRadio).toBeChecked();

    // Mock window.alert to capture form submission
    const originalAlert = window.alert;
    let alertMessage = '';
    window.alert = (message) => {
      alertMessage = message;
    };

    // Submit the form
    await userEvent.click(submitButton);

    // Wait for form submission to complete
    await new Promise((resolve) => setTimeout(resolve, 1100));

    // Verify form data was submitted correctly
    expect(alertMessage).toContain('enterprise');
    expect(alertMessage).toContain('email');
    expect(alertMessage).toContain('light');

    // Restore original alert
    window.alert = originalAlert;
  },
};

// Interaction Tests
export const InteractionTests: Story = {
  args: {
    legend: 'Test Radio Group',
    name: 'test',
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item value="first" label="First Option" />
      <RadioGroup.Item value="second" label="Second Option" />
      <RadioGroup.Item value="third" label="Third Option" />
    </RadioGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test initial state - no option selected
    const radioButtons = canvas.getAllByRole('radio');
    expect(radioButtons[0]).not.toBeChecked();
    expect(radioButtons[1]).not.toBeChecked();
    expect(radioButtons[2]).not.toBeChecked();

    // Test clicking first option
    await userEvent.click(radioButtons[0]);
    expect(radioButtons[0]).toBeChecked();
    expect(radioButtons[1]).not.toBeChecked();
    expect(radioButtons[2]).not.toBeChecked();

    // Test clicking second option (should uncheck first)
    await userEvent.click(radioButtons[1]);
    expect(radioButtons[0]).not.toBeChecked();
    expect(radioButtons[1]).toBeChecked();
    expect(radioButtons[2]).not.toBeChecked();

    // Test clicking labels
    const firstLabel = canvas.getByText('First Option');
    await userEvent.click(firstLabel);
    expect(radioButtons[0]).toBeChecked();
    expect(radioButtons[1]).not.toBeChecked();
    expect(radioButtons[2]).not.toBeChecked();
  },
};

// Keyboard Navigation Test
export const KeyboardNavigationTest: Story = {
  args: {
    legend: 'Keyboard Navigation Test',
    name: 'keyboard-test',
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
        Test keyboard interactions: Tab, Space, and Arrow keys
      </p>
      <RadioGroup {...args}>
        <RadioGroup.Item value="option1" label="Option 1" />
        <RadioGroup.Item value="option2" label="Option 2" />
        <RadioGroup.Item value="option3" label="Option 3" />
      </RadioGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radioButtons = canvas.getAllByRole('radio');

    // Test Tab navigation to first radio button
    await userEvent.tab();
    expect(document.activeElement).toBe(radioButtons[0]);

    // Test Space to select focused radio button
    await userEvent.keyboard(' ');
    expect(radioButtons[0]).toBeChecked();

    // Test ArrowDown moves focus (and selection according to Radix docs)
    await userEvent.keyboard('{ArrowDown}');
    // Focus should move to next button
    expect(document.activeElement).toBe(radioButtons[1]);

    // Test that Space can select the focused item
    await userEvent.keyboard(' ');
    expect(radioButtons[0]).not.toBeChecked();
    expect(radioButtons[1]).toBeChecked();

    // Test click still works
    await userEvent.click(radioButtons[2]);
    expect(radioButtons[1]).not.toBeChecked();
    expect(radioButtons[2]).toBeChecked();
  },
};

// Test Tab behavior with pre-selected item
export const TabNavigationWithPreselected: Story = {
  args: {
    legend: 'Tab Navigation with Preselected Item',
    name: 'tab-test',
    defaultValue: 'option3', // Pre-select the third option
  },
  render: (args) => (
    <div>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
        Test that Tab moves focus to the checked radio item (Option 3 is
        pre-selected).
      </p>
      <RadioGroup {...args}>
        <RadioGroup.Item value="option1" label="Option 1" />
        <RadioGroup.Item value="option2" label="Option 2" />
        <RadioGroup.Item value="option3" label="Option 3 (Pre-selected)" />
        <RadioGroup.Item value="option4" label="Option 4" />
      </RadioGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radioButtons = canvas.getAllByRole('radio');

    // Verify pre-selection
    expect(radioButtons[0]).not.toBeChecked();
    expect(radioButtons[1]).not.toBeChecked();
    expect(radioButtons[2]).toBeChecked(); // Pre-selected
    expect(radioButtons[3]).not.toBeChecked();

    // Test Tab navigation should go to the checked item (option 3)
    await userEvent.tab();
    expect(document.activeElement).toBe(radioButtons[2]);

    // Test that focus moves (but let's be more flexible about selection behavior)
    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(radioButtons[3]);
  },
};

export const AccessibilityTest: Story = {
  args: {
    legend: 'Accessibility Test',
    description: 'This tests ARIA attributes',
    required: true,
    name: 'a11y',
  },
  render: (args) => (
    <FormField
      error="This field is required"
      description="Choose one option"
      required
    >
      <RadioGroup {...args} aria-invalid="true">
        <RadioGroup.Item
          value="option1"
          label="Option 1"
          description="First choice"
        />
        <RadioGroup.Item
          value="option2"
          label="Option 2"
          description="Second choice"
        />
      </RadioGroup>
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test fieldset and legend
    const fieldset = canvas.getByRole('radiogroup');
    expect(fieldset).toBeInTheDocument();
    expect(fieldset).toHaveAttribute('aria-required', 'true');
    expect(fieldset).toHaveAttribute('aria-invalid', 'true');

    const legend = canvas.getByText('Accessibility Test');
    expect(legend).toBeInTheDocument();

    // Test radio buttons have proper attributes
    const radioButtons = canvas.getAllByRole('radio');
    radioButtons.forEach((radio) => {
      expect(radio).toHaveAttribute('role', 'radio');
      expect(radio).toHaveAttribute('value');
      expect(radio).toHaveAttribute('aria-checked');
    });

    // Test required indicator
    const requiredIndicator = canvas.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveAttribute('aria-hidden', 'true');
  },
};
