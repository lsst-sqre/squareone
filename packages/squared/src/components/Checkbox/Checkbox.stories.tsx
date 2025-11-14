import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { useForm } from 'react-hook-form';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import FormField from '../FormField';
import Checkbox from './Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A Checkbox component for boolean or multi-select inputs. Built with Radix UI primitives for accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the checkbox',
    },
    label: {
      control: 'text',
      description: 'Label text for the checkbox',
    },
    description: {
      control: 'text',
      description: 'Optional description text displayed below the label',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic variations
export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
  },
};

export const Checked: Story = {
  args: {
    label: 'Email notifications',
    checked: true,
  },
};

export const Indeterminate: Story = {
  args: {
    label: 'Select all options',
    checked: 'indeterminate',
  },
};

export const WithDescription: Story = {
  args: {
    label: 'Marketing communications',
    description: 'Receive updates about new features and promotions',
  },
};

export const WithoutLabel: Story = {
  args: {},
  render: (args: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <Checkbox {...args} id="unlabeled-checkbox" />
      <label htmlFor="unlabeled-checkbox">External label element</label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Checkbox label="Disabled unchecked" disabled />
      <Checkbox label="Disabled checked" checked disabled />
      <Checkbox
        label="Disabled indeterminate"
        checked="indeterminate"
        disabled
      />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Checkbox label="Required checkbox" required />
      <Checkbox
        label="Required with description"
        description="This field is required to continue"
        required
      />
      <Checkbox
        label="Optional checkbox"
        description="This field is optional"
      />
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <Checkbox
        size="sm"
        label="Small checkbox"
        description="This is a small checkbox"
      />
      <Checkbox
        size="md"
        label="Medium checkbox (default)"
        description="This is the default medium size"
      />
      <Checkbox
        size="lg"
        label="Large checkbox"
        description="This is a large checkbox"
      />
    </div>
  ),
};

export const WithFormField: Story = {
  render: () => (
    <FormField
      error="You must accept the terms to continue"
      description="By checking this box, you agree to our terms of service"
      required
    >
      <FormField.Checkbox
        label="I agree to the terms and conditions"
        aria-invalid="true"
      />
    </FormField>
  ),
};

export const MultipleCheckboxes: Story = {
  render: () => {
    const [preferences, setPreferences] = React.useState<string[]>(['email']);

    const handleChange = (
      value: string,
      checked: boolean | 'indeterminate'
    ) => {
      if (checked && checked !== 'indeterminate') {
        setPreferences([...preferences, value]);
      } else {
        setPreferences(preferences.filter((pref) => pref !== value));
      }
    };

    return (
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Notification Preferences</h3>
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
        >
          <Checkbox
            label="Email notifications"
            description="Receive updates via email"
            checked={preferences.includes('email')}
            onCheckedChange={(checked) => handleChange('email', checked)}
          />
          <Checkbox
            label="SMS notifications"
            description="Receive text message alerts"
            checked={preferences.includes('sms')}
            onCheckedChange={(checked) => handleChange('sms', checked)}
          />
          <Checkbox
            label="Push notifications"
            description="Receive browser push notifications"
            checked={preferences.includes('push')}
            onCheckedChange={(checked) => handleChange('push', checked)}
          />
          <Checkbox
            label="Weekly newsletter"
            description="Get a weekly digest of updates"
            checked={preferences.includes('newsletter')}
            onCheckedChange={(checked) => handleChange('newsletter', checked)}
          />
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}>
          Selected: {preferences.length > 0 ? preferences.join(', ') : 'None'}
        </p>
      </div>
    );
  },
};

export const ControlledExample: Story = {
  render: () => {
    const [checked, setChecked] = React.useState(false);
    const [indeterminate, setIndeterminate] = React.useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p>
          Checkbox state:{' '}
          <strong>
            {checked
              ? 'Checked'
              : indeterminate
                ? 'Indeterminate'
                : 'Unchecked'}
          </strong>
        </p>
        <Checkbox
          label="Controlled checkbox"
          checked={indeterminate ? 'indeterminate' : checked}
          onCheckedChange={(newChecked) => {
            setIndeterminate(false);
            setChecked(!!newChecked);
          }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            size="sm"
            onClick={() => {
              setChecked(true);
              setIndeterminate(false);
            }}
          >
            Check
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setChecked(false);
              setIndeterminate(false);
            }}
          >
            Uncheck
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setIndeterminate(true);
              setChecked(false);
            }}
          >
            Indeterminate
          </Button>
        </div>
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
        terms: false,
        newsletter: true,
        preferences: ['email', 'push'] as string[],
        marketing: false,
      },
    });

    const preferences = watch('preferences') || [];

    const onSubmit = async (data: any) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(`Form submitted with data: ${JSON.stringify(data, null, 2)}`);
    };

    const handlePreferenceChange = (
      value: string,
      checked: boolean | 'indeterminate'
    ) => {
      const currentPrefs = preferences;
      if (checked && checked !== 'indeterminate') {
        setValue('preferences', [...currentPrefs, value]);
      } else {
        setValue(
          'preferences',
          currentPrefs.filter((pref: string) => pref !== value)
        );
      }
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
        <FormField error={errors.terms?.message} required>
          {/* Controlled Checkbox to properly apply default values from React Hook Form */}
          <FormField.Checkbox
            label="I agree to the terms and conditions"
            description="You must accept the terms to continue"
            checked={watch('terms')}
            onCheckedChange={(checked) => setValue('terms', !!checked)}
          />
        </FormField>

        <FormField description="Choose how you'd like to receive updates">
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
              Notification Preferences
            </h4>
            <Checkbox
              label="Email notifications"
              description="Receive updates via email"
              checked={preferences.includes('email')}
              onCheckedChange={(checked) =>
                handlePreferenceChange('email', checked)
              }
            />
            <Checkbox
              label="Push notifications"
              description="Receive browser notifications"
              checked={preferences.includes('push')}
              onCheckedChange={(checked) =>
                handlePreferenceChange('push', checked)
              }
            />
            <Checkbox
              label="SMS alerts"
              description="Receive text message alerts"
              checked={preferences.includes('sms')}
              onCheckedChange={(checked) =>
                handlePreferenceChange('sms', checked)
              }
            />
          </div>
        </FormField>

        <FormField>
          <FormField.Checkbox
            label="Subscribe to newsletter"
            description="Get weekly updates about new features"
            checked={watch('newsletter')}
            onCheckedChange={(checked) => setValue('newsletter', !!checked)}
          />
        </FormField>

        <FormField>
          <FormField.Checkbox
            label="Marketing communications"
            description="Receive promotional offers and product updates"
            checked={watch('marketing')}
            onCheckedChange={(checked) => setValue('marketing', !!checked)}
          />
        </FormField>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button
            type="submit"
            role="primary"
            size="md"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Form'}
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
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Find checkboxes by their role since getByLabelText doesn't work with Radix UI structure
    const newsletterCheckbox = canvas.getByRole('checkbox', {
      name: /Subscribe to newsletter/,
    });
    const emailPrefCheckbox = canvas.getByRole('checkbox', {
      name: /Email notifications/,
    });
    const pushPrefCheckbox = canvas.getByRole('checkbox', {
      name: /Push notifications/,
    });
    const termsCheckbox = canvas.getByRole('checkbox', {
      name: /I agree to the terms/,
    });

    expect(newsletterCheckbox).toBeChecked();
    expect(emailPrefCheckbox).toBeChecked();
    expect(pushPrefCheckbox).toBeChecked();
    expect(termsCheckbox).not.toBeChecked();

    // Test checking the terms checkbox
    await userEvent.click(termsCheckbox);
    expect(termsCheckbox).toBeChecked();

    // Test unchecking a preference
    await userEvent.click(emailPrefCheckbox);
    expect(emailPrefCheckbox).not.toBeChecked();
    expect(pushPrefCheckbox).toBeChecked(); // Should remain checked

    // Test marketing checkbox
    const marketingCheckbox = canvas.getByRole('checkbox', {
      name: /Marketing communications/,
    });
    expect(marketingCheckbox).not.toBeChecked();
    await userEvent.click(marketingCheckbox);
    expect(marketingCheckbox).toBeChecked();

    // Test reset button
    const resetButton = canvas.getByText('Reset Form');
    await userEvent.click(resetButton);

    // Verify defaults are restored
    expect(newsletterCheckbox).toBeChecked();
    expect(emailPrefCheckbox).toBeChecked();
    expect(pushPrefCheckbox).toBeChecked();
    expect(termsCheckbox).not.toBeChecked();
    expect(marketingCheckbox).not.toBeChecked();

    // Test form submission workflow
    await userEvent.click(termsCheckbox); // Check terms to enable submission
    expect(termsCheckbox).toBeChecked();

    const submitButton = canvas.getByText('Submit Form');

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
    expect(alertMessage).toContain('true'); // terms should be true
    expect(alertMessage).toContain('newsletter');
    expect(alertMessage).toContain('email');
    expect(alertMessage).toContain('push');

    // Restore original alert
    window.alert = originalAlert;
  },
};

// Interaction Tests
export const InteractionTests: Story = {
  args: {
    label: 'Test checkbox',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Test initial state - unchecked
    const checkbox = canvas.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    // Test clicking checkbox
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    expect(checkbox).toHaveAttribute('aria-checked', 'true');

    // Test clicking again to uncheck
    await userEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');

    // Test clicking label
    const label = canvas.getByText('Test checkbox');
    await userEvent.click(label);
    expect(checkbox).toBeChecked();
  },
};

// Keyboard Navigation Test
export const KeyboardNavigationTest: Story = {
  render: () => (
    <div>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
        Test keyboard interactions: Tab to focus, Space to toggle
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Checkbox label="First checkbox" />
        <Checkbox label="Second checkbox" />
        <Checkbox label="Third checkbox" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const checkboxes = canvas.getAllByRole('checkbox');

    // Test Tab navigation to first checkbox
    await userEvent.tab();
    expect(document.activeElement).toBe(checkboxes[0]);

    // Test Space to toggle
    await userEvent.keyboard(' ');
    expect(checkboxes[0]).toBeChecked();

    // Test Tab to next checkbox
    await userEvent.tab();
    expect(document.activeElement).toBe(checkboxes[1]);

    // Test Space to toggle second checkbox
    await userEvent.keyboard(' ');
    expect(checkboxes[1]).toBeChecked();
    expect(checkboxes[0]).toBeChecked(); // First should remain checked

    // Test click still works after keyboard navigation
    await userEvent.click(checkboxes[2]);
    expect(checkboxes[2]).toBeChecked();
  },
};

// Touch Target Test
export const TouchTargetTest: Story = {
  render: () => (
    <div>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
        Test touch targets: The clickable area extends beyond the visual
        checkbox to meet WCAG 2.5.5 AAA requirements (44px minimum).
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Checkbox size="sm" label="Small checkbox (visual 14px, touch 44px)" />
        <Checkbox size="md" label="Medium checkbox (visual 16px, touch 44px)" />
        <Checkbox size="lg" label="Large checkbox (visual 20px, touch 44px)" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const checkboxes = canvas.getAllByRole('checkbox');

    // Test that all checkboxes can be clicked and toggled
    for (const checkbox of checkboxes) {
      expect(checkbox).not.toBeChecked();
      await userEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    }
  },
};

export const AccessibilityTest: Story = {
  args: {
    label: 'Accessibility Test Checkbox',
    description: 'This tests ARIA attributes',
  },
  render: (args: any) => (
    <FormField
      error="This field is required"
      description="Choose to accept the terms"
      required
    >
      <FormField.Checkbox {...args} aria-invalid="true" />
    </FormField>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Test checkbox has proper attributes
    const checkbox = canvas.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('aria-checked');
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAttribute('aria-describedby');

    // Test label association
    const labelText = canvas.getByText('Accessibility Test Checkbox');
    expect(labelText).toBeInTheDocument();
    // Find the actual label element (parent of the text span)
    const label = labelText.closest('label');
    expect(label).toBeInTheDocument();
    expect(label?.getAttribute('for')).toBe(checkbox.getAttribute('id'));

    // Test description is linked
    const description = canvas.getByText('This tests ARIA attributes');
    expect(description).toBeInTheDocument();

    // Test error message is linked
    const errorMessage = canvas.getByText('This field is required');
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveAttribute('role', 'status');
  },
};
