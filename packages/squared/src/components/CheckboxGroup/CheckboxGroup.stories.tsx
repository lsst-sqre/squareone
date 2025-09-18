import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect } from 'storybook/test';
import { useForm } from 'react-hook-form';
import CheckboxGroup from './CheckboxGroup';
import FormField from '../FormField';
import { Button } from '../Button';

const meta: Meta<typeof CheckboxGroup> = {
  title: 'Components/CheckboxGroup',
  component: CheckboxGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A CheckboxGroup component for multiple selection from a group of options. Built with semantic fieldset/legend elements for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    legend: {
      control: 'text',
      description: 'The legend/label for the checkbox group',
    },
    description: {
      control: 'text',
      description: 'Optional description text displayed below the legend',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Layout orientation of the checkbox options',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variations
export const Default: Story = {
  args: {
    legend: 'Preferences',
  },
  render: (args) => (
    <CheckboxGroup {...args}>
      <CheckboxGroup.Item
        name="notifications"
        value="email"
        label="Email notifications"
      />
      <CheckboxGroup.Item name="notifications" value="sms" label="SMS alerts" />
      <CheckboxGroup.Item
        name="notifications"
        value="push"
        label="Push notifications"
      />
      <CheckboxGroup.Item
        name="notifications"
        value="newsletter"
        label="Newsletter subscription"
      />
    </CheckboxGroup>
  ),
};

export const WithDescriptions: Story = {
  args: {
    legend: 'Account Features',
    description: 'Select the features you want to enable for your account',
  },
  render: (args) => (
    <CheckboxGroup {...args}>
      <CheckboxGroup.Item
        name="features"
        value="analytics"
        label="Analytics Dashboard"
        description="View detailed usage statistics and reports"
      />
      <CheckboxGroup.Item
        name="features"
        value="api"
        label="API Access"
        description="Programmatic access to your data"
      />
      <CheckboxGroup.Item
        name="features"
        value="export"
        label="Data Export"
        description="Download your data in various formats"
      />
      <CheckboxGroup.Item
        name="features"
        value="support"
        label="Priority Support"
        description="Get faster response times for support requests"
      />
    </CheckboxGroup>
  ),
};

export const Required: Story = {
  args: {
    legend: 'Terms and Conditions',
  },
  render: (args) => (
    <CheckboxGroup {...args}>
      <CheckboxGroup.Item
        name="agreements"
        value="terms"
        label="I agree to the Terms of Service"
        required
      />
      <CheckboxGroup.Item
        name="agreements"
        value="privacy"
        label="I agree to the Privacy Policy"
        required
      />
      <CheckboxGroup.Item
        name="agreements"
        value="cookies"
        label="I accept the use of cookies"
      />
      <CheckboxGroup.Item
        name="agreements"
        value="marketing"
        label="I want to receive marketing communications"
      />
    </CheckboxGroup>
  ),
};

export const HorizontalLayout: Story = {
  args: {
    legend: 'Availability',
    orientation: 'horizontal',
  },
  render: (args) => (
    <CheckboxGroup {...args}>
      <CheckboxGroup.Item name="days" value="mon" label="Monday" />
      <CheckboxGroup.Item name="days" value="tue" label="Tuesday" />
      <CheckboxGroup.Item name="days" value="wed" label="Wednesday" />
      <CheckboxGroup.Item name="days" value="thu" label="Thursday" />
      <CheckboxGroup.Item name="days" value="fri" label="Friday" />
      <CheckboxGroup.Item name="days" value="sat" label="Saturday" />
      <CheckboxGroup.Item name="days" value="sun" label="Sunday" />
    </CheckboxGroup>
  ),
};

export const DisabledOptions: Story = {
  args: {
    legend: 'Service Options',
    description: 'Some options may not be available in your region',
  },
  render: (args) => (
    <CheckboxGroup {...args}>
      <CheckboxGroup.Item
        name="services"
        value="standard"
        label="Standard Delivery"
        description="5-7 business days"
      />
      <CheckboxGroup.Item
        name="services"
        value="express"
        label="Express Delivery"
        description="2-3 business days"
      />
      <CheckboxGroup.Item
        name="services"
        value="overnight"
        label="Overnight Delivery"
        description="Next business day"
        disabled
      />
      <CheckboxGroup.Item
        name="services"
        value="sameday"
        label="Same Day Delivery"
        description="Within 4 hours"
        disabled
      />
    </CheckboxGroup>
  ),
};

export const PreSelected: Story = {
  args: {
    legend: 'Default Settings',
    description: 'These settings are recommended for most users',
  },
  render: (args) => (
    <CheckboxGroup {...args}>
      <CheckboxGroup.Item
        name="defaults"
        value="autosave"
        label="Auto-save documents"
        defaultChecked
      />
      <CheckboxGroup.Item
        name="defaults"
        value="backup"
        label="Automatic backups"
        defaultChecked
      />
      <CheckboxGroup.Item
        name="defaults"
        value="updates"
        label="Automatic updates"
      />
      <CheckboxGroup.Item
        name="defaults"
        value="telemetry"
        label="Usage analytics"
      />
    </CheckboxGroup>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <CheckboxGroup legend="Small Size">
        <CheckboxGroup.Item
          name="small"
          value="option1"
          label="Small checkbox"
          size="sm"
        />
        <CheckboxGroup.Item
          name="small"
          value="option2"
          label="Another small option"
          size="sm"
        />
      </CheckboxGroup>

      <CheckboxGroup legend="Medium Size (Default)">
        <CheckboxGroup.Item
          name="medium"
          value="option1"
          label="Medium checkbox"
        />
        <CheckboxGroup.Item
          name="medium"
          value="option2"
          label="Another medium option"
        />
      </CheckboxGroup>

      <CheckboxGroup legend="Large Size">
        <CheckboxGroup.Item
          name="large"
          value="option1"
          label="Large checkbox"
          size="lg"
        />
        <CheckboxGroup.Item
          name="large"
          value="option2"
          label="Another large option"
          size="lg"
        />
      </CheckboxGroup>
    </div>
  ),
};

export const WithFormField: Story = {
  render: () => (
    <FormField
      error="Please select at least one option"
      description="Choose your preferred notification methods"
      required
    >
      <CheckboxGroup legend="Notification Preferences">
        <CheckboxGroup.Item
          name="notifications"
          value="email"
          label="Email notifications"
          description="Receive updates via email"
        />
        <CheckboxGroup.Item
          name="notifications"
          value="sms"
          label="SMS notifications"
          description="Receive updates via text message"
        />
        <CheckboxGroup.Item
          name="notifications"
          value="push"
          label="Push notifications"
          description="Receive updates on your device"
        />
      </CheckboxGroup>
    </FormField>
  ),
};

export const ControlledExample: Story = {
  render: () => {
    const [selectedValues, setSelectedValues] = React.useState<string[]>([
      'option2',
    ]);

    const handleCheckboxChange = (value: string, checked: boolean | string) => {
      const isChecked = checked === true || checked === 'indeterminate';
      setSelectedValues((prev) =>
        isChecked ? [...prev, value] : prev.filter((v) => v !== value)
      );
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p>
          Selected values:{' '}
          <strong>
            {selectedValues.length > 0 ? selectedValues.join(', ') : 'None'}
          </strong>
        </p>
        <CheckboxGroup legend="Controlled Checkbox Group">
          <CheckboxGroup.Item
            name="controlled"
            value="option1"
            label="First Option"
            checked={selectedValues.includes('option1')}
            onCheckedChange={(checked) =>
              handleCheckboxChange('option1', checked)
            }
          />
          <CheckboxGroup.Item
            name="controlled"
            value="option2"
            label="Second Option"
            checked={selectedValues.includes('option2')}
            onCheckedChange={(checked) =>
              handleCheckboxChange('option2', checked)
            }
          />
          <CheckboxGroup.Item
            name="controlled"
            value="option3"
            label="Third Option"
            checked={selectedValues.includes('option3')}
            onCheckedChange={(checked) =>
              handleCheckboxChange('option3', checked)
            }
          />
        </CheckboxGroup>
        <Button
          onClick={() => setSelectedValues([])}
          size="sm"
          variant="outline"
        >
          Clear All
        </Button>
      </div>
    );
  },
};

// React Hook Form Integration Story
export const ReactHookFormIntegration: Story = {
  render: () => {
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
      reset,
      watch,
    } = useForm({
      defaultValues: {
        notifications: [],
        features: [],
        agreements: [],
      },
    });

    const watchedValues = watch();

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
          width: '500px',
        }}
      >
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          <h3>Current form values:</h3>
          <pre>{JSON.stringify(watchedValues, null, 2)}</pre>
        </div>

        <FormField
          error={errors.notifications?.message}
          description="Choose how you'd like to be notified"
        >
          <CheckboxGroup legend="Notification Preferences">
            <CheckboxGroup.Item
              {...register('notifications', {
                required: 'Please select at least one notification method',
              })}
              value="email"
              label="Email notifications"
              description="Get updates via email"
            />
            <CheckboxGroup.Item
              {...register('notifications')}
              value="sms"
              label="SMS notifications"
              description="Get updates via text"
            />
            <CheckboxGroup.Item
              {...register('notifications')}
              value="push"
              label="Push notifications"
              description="Get updates on your device"
            />
          </CheckboxGroup>
        </FormField>

        <FormField
          error={errors.features?.message}
          description="Select additional features for your account"
        >
          <CheckboxGroup legend="Account Features">
            <CheckboxGroup.Item
              {...register('features')}
              value="analytics"
              label="Analytics Dashboard"
              description="View detailed reports"
            />
            <CheckboxGroup.Item
              {...register('features')}
              value="api"
              label="API Access"
              description="Programmatic access"
            />
            <CheckboxGroup.Item
              {...register('features')}
              value="export"
              label="Data Export"
              description="Download your data"
            />
          </CheckboxGroup>
        </FormField>

        <FormField
          error={errors.agreements?.message}
          required
          description="You must agree to continue"
        >
          <CheckboxGroup legend="Legal Agreements">
            <CheckboxGroup.Item
              {...register('agreements', {
                required: 'You must agree to the terms and privacy policy',
              })}
              value="terms"
              label="I agree to the Terms of Service"
            />
            <CheckboxGroup.Item
              {...register('agreements')}
              value="privacy"
              label="I agree to the Privacy Policy"
            />
            <CheckboxGroup.Item
              {...register('agreements')}
              value="marketing"
              label="I want to receive marketing communications"
            />
          </CheckboxGroup>
        </FormField>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
          </Button>
          <Button type="button" variant="outline" onClick={() => reset()}>
            Reset Form
          </Button>
        </div>
      </form>
    );
  },
};

// Interaction Tests
export const InteractionTests: Story = {
  render: () => (
    <CheckboxGroup legend="Interactive Test Group">
      <CheckboxGroup.Item
        name="test"
        value="option1"
        label="Click me to toggle"
        data-testid="checkbox-1"
      />
      <CheckboxGroup.Item
        name="test"
        value="option2"
        label="Use keyboard to navigate"
        data-testid="checkbox-2"
      />
      <CheckboxGroup.Item
        name="test"
        value="option3"
        label="Multiple selections allowed"
        data-testid="checkbox-3"
      />
    </CheckboxGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test clicking to toggle checkboxes
    const checkbox1 = canvas.getByTestId('checkbox-1');
    const checkbox2 = canvas.getByTestId('checkbox-2');

    // Initial state: unchecked
    expect(checkbox1).not.toBeChecked();
    expect(checkbox2).not.toBeChecked();

    // Click to check
    await userEvent.click(checkbox1);
    expect(checkbox1).toBeChecked();

    // Click to uncheck
    await userEvent.click(checkbox1);
    expect(checkbox1).not.toBeChecked();

    // Multiple selections
    await userEvent.click(checkbox1);
    await userEvent.click(checkbox2);
    expect(checkbox1).toBeChecked();
    expect(checkbox2).toBeChecked();

    // Keyboard navigation
    checkbox1.focus();
    await userEvent.keyboard(' ');
    expect(checkbox1).not.toBeChecked();
  },
};

export const AccessibilityTest: Story = {
  render: () => (
    <CheckboxGroup
      legend="Accessibility Test Group"
      description="This group tests ARIA attributes and screen reader support"
    >
      <CheckboxGroup.Item
        name="accessibility"
        value="screenreader"
        label="Screen reader compatible"
        description="Works with NVDA, JAWS, and VoiceOver"
      />
      <CheckboxGroup.Item
        name="accessibility"
        value="keyboard"
        label="Keyboard navigation"
        description="Fully navigable without a mouse"
      />
      <CheckboxGroup.Item
        name="accessibility"
        value="focus"
        label="Focus indicators"
        description="Clear visual focus states"
      />
    </CheckboxGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test that fieldset and options group have proper structure
    const groups = canvas.getAllByRole('group');
    expect(groups.length).toBeGreaterThanOrEqual(1);

    // Test that legend is present
    const legend = canvas.getByText('Accessibility Test Group');
    expect(legend).toBeInTheDocument();

    // Test that all checkboxes are present
    const checkboxes = canvas.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);

    // Test that checkboxes have proper labels
    expect(
      canvas.getByRole('checkbox', { name: /screen reader compatible/i })
    ).toBeInTheDocument();
    expect(
      canvas.getByRole('checkbox', { name: /keyboard navigation/i })
    ).toBeInTheDocument();
    expect(
      canvas.getByRole('checkbox', { name: /focus indicators/i })
    ).toBeInTheDocument();
  },
};
