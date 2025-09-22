import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within, expect, waitFor } from 'storybook/test';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Select } from './Select';
import FormField from '../FormField';
import { Button } from '../Button';
import styles from './Select.module.css';

const meta: Meta<typeof Select> = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the select trigger',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the select should take full width',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the select is disabled',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic select story
export const BasicSelect: Story = {
  render: () => (
    <Select placeholder="Choose a country">
      <Select.Group label="North America">
        <Select.Item value="us">United States</Select.Item>
        <Select.Item value="ca">Canada</Select.Item>
        <Select.Item value="mx">Mexico</Select.Item>
      </Select.Group>
      <Select.Separator />
      <Select.Group label="Europe">
        <Select.Item value="uk">United Kingdom</Select.Item>
        <Select.Item value="fr">France</Select.Item>
        <Select.Item value="de">Germany</Select.Item>
        <Select.Item value="es">Spain</Select.Item>
      </Select.Group>
      <Select.Separator />
      <Select.Group label="Asia">
        <Select.Item value="jp">Japan</Select.Item>
        <Select.Item value="cn">China</Select.Item>
        <Select.Item value="kr">South Korea</Select.Item>
      </Select.Group>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    // Test that select is rendered with placeholder
    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveTextContent('Choose a country');

    // Test opening the dropdown
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Test that groups are rendered (search in document since groups are portaled)
    await waitFor(() => {
      expect(
        within(document.body).getByText('North America')
      ).toBeInTheDocument();
    });
    expect(within(document.body).getByText('Europe')).toBeInTheDocument();
    expect(within(document.body).getByText('Asia')).toBeInTheDocument();

    // Test that options are rendered (search in document since options are portaled)
    await waitFor(() => {
      expect(
        within(document.body).getByRole('option', { name: 'United States' })
      ).toBeInTheDocument();
    });
    expect(
      within(document.body).getByRole('option', { name: 'France' })
    ).toBeInTheDocument();
  },
};

// Pre-selected value
export const WithDefaultValue: Story = {
  render: () => (
    <Select defaultValue="uk">
      <Select.Group label="Europe">
        <Select.Item value="uk">United Kingdom</Select.Item>
        <Select.Item value="fr">France</Select.Item>
        <Select.Item value="de">Germany</Select.Item>
      </Select.Group>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    // Test that the pre-selected value is displayed
    expect(trigger).toHaveTextContent('United Kingdom');
  },
};

// Disabled options
export const WithDisabledOptions: Story = {
  render: () => (
    <Select placeholder="Choose a service level">
      <Select.Item value="basic">Basic</Select.Item>
      <Select.Item value="premium">Premium</Select.Item>
      <Select.Item value="enterprise" disabled>
        Enterprise (Coming Soon)
      </Select.Item>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    await userEvent.click(trigger);

    const disabledOption = await waitFor(() =>
      within(document.body).getByRole('option', {
        name: 'Enterprise (Coming Soon)',
      })
    );
    expect(disabledOption).toHaveAttribute('data-disabled');
  },
};

// Size variants
export const SizeVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Select size="sm" placeholder="Small select">
        <Select.Item value="small">Small option</Select.Item>
      </Select>
      <Select size="md" placeholder="Medium select">
        <Select.Item value="medium">Medium option</Select.Item>
      </Select>
      <Select size="lg" placeholder="Large select">
        <Select.Item value="large">Large option</Select.Item>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const triggers = canvas.getAllByRole('combobox');

    expect(triggers[0]).toHaveClass(styles.sm);
    expect(triggers[1]).toHaveClass(styles.md);
    expect(triggers[2]).toHaveClass(styles.lg);
  },
};

// Full width variant
export const FullWidth: Story = {
  render: () => (
    <div style={{ width: '400px' }}>
      <Select fullWidth placeholder="Full width select">
        <Select.Item value="option1">Option 1</Select.Item>
        <Select.Item value="option2">Option 2</Select.Item>
        <Select.Item value="option3">Option 3</Select.Item>
      </Select>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.parentElement!);
    const container = canvas
      .getByRole('combobox')
      .closest('[class*="container"]');
    expect(container).toHaveClass(styles.fullWidth);
  },
};

// Long scrollable list
export const ScrollableList: Story = {
  render: () => (
    <Select placeholder="Choose a programming language">
      <Select.Group label="Popular">
        <Select.Item value="javascript">JavaScript</Select.Item>
        <Select.Item value="typescript">TypeScript</Select.Item>
        <Select.Item value="python">Python</Select.Item>
        <Select.Item value="java">Java</Select.Item>
        <Select.Item value="csharp">C#</Select.Item>
      </Select.Group>
      <Select.Separator />
      <Select.Group label="Systems">
        <Select.Item value="rust">Rust</Select.Item>
        <Select.Item value="cpp">C++</Select.Item>
        <Select.Item value="c">C</Select.Item>
        <Select.Item value="go">Go</Select.Item>
        <Select.Item value="zig">Zig</Select.Item>
      </Select.Group>
      <Select.Separator />
      <Select.Group label="Functional">
        <Select.Item value="haskell">Haskell</Select.Item>
        <Select.Item value="elm">Elm</Select.Item>
        <Select.Item value="clojure">Clojure</Select.Item>
        <Select.Item value="ocaml">OCaml</Select.Item>
      </Select.Group>
      <Select.Separator />
      <Select.Group label="Web Assembly">
        <Select.Item value="wasm">WebAssembly</Select.Item>
        <Select.Item value="wat">WebAssembly Text</Select.Item>
      </Select.Group>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    await userEvent.click(trigger);

    // Test scroll buttons appear (should be present for long lists)
    const scrollButtons = document.querySelectorAll(`[class*="scrollButton"]`);
    expect(scrollButtons.length).toBeGreaterThan(0);
  },
};

// Disabled state
export const DisabledState: Story = {
  render: () => (
    <Select disabled placeholder="This select is disabled">
      <Select.Item value="option1">Option 1</Select.Item>
      <Select.Item value="option2">Option 2</Select.Item>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    expect(trigger).toBeDisabled();

    // Test that clicking doesn't open the dropdown
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

// Error state (using FormField)
export const WithFormFieldError: Story = {
  render: () => (
    <FormField error="Please select a valid option" required>
      <FormField.Label htmlFor="country-select">Country</FormField.Label>
      <FormField.Select
        id="country-select"
        placeholder="Choose your country"
        aria-invalid={true}
      >
        <Select.Group label="North America">
          <Select.Item value="us">United States</Select.Item>
          <Select.Item value="ca">Canada</Select.Item>
        </Select.Group>
        <Select.Group label="Europe">
          <Select.Item value="uk">United Kingdom</Select.Item>
          <Select.Item value="fr">France</Select.Item>
        </Select.Group>
      </FormField.Select>
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    const errorMessage = canvas.getByText('Please select a valid option');
    const label = canvas.getByText('Country');

    // Test error state styling and ARIA attributes
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAttribute('aria-describedby');
    expect(errorMessage).toHaveAttribute('role', 'status');
    expect(errorMessage).toHaveAttribute('aria-live', 'polite');

    // Test required label
    const requiredIndicator = label.querySelector(`[class*="required"]`);
    expect(requiredIndicator).toBeInTheDocument();
  },
};

// FormField integration with description
export const WithFormFieldDescription: Story = {
  render: () => (
    <FormField description="Select your primary programming language">
      <FormField.Label htmlFor="language-select">
        Programming Language
      </FormField.Label>
      <FormField.Select id="language-select" placeholder="Choose a language">
        <Select.Group label="Popular">
          <Select.Item value="javascript">JavaScript</Select.Item>
          <Select.Item value="python">Python</Select.Item>
          <Select.Item value="java">Java</Select.Item>
        </Select.Group>
      </FormField.Select>
    </FormField>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    const description = canvas.getByText(
      'Select your primary programming language'
    );

    // Test that description is properly associated
    expect(trigger).toHaveAttribute('aria-describedby');
    expect(description).toBeInTheDocument();
  },
};

// Controlled component example
export const ControlledSelect: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Select
          value={value}
          onValueChange={setValue}
          placeholder="Choose a framework"
        >
          <Select.Group label="React">
            <Select.Item value="react">React</Select.Item>
            <Select.Item value="next">Next.js</Select.Item>
            <Select.Item value="gatsby">Gatsby</Select.Item>
          </Select.Group>
          <Select.Separator />
          <Select.Group label="Vue">
            <Select.Item value="vue">Vue.js</Select.Item>
            <Select.Item value="nuxt">Nuxt.js</Select.Item>
          </Select.Group>
        </Select>
        <div>Selected value: {value || 'None'}</div>
        <div>
          <Button size="sm" onClick={() => setValue('')}>
            Clear Selection
          </Button>
        </div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');
    const selectedValue = canvas.getByText(/Selected value:/);
    const clearButton = canvas.getByRole('button', { name: 'Clear Selection' });

    // Test initial state
    expect(selectedValue).toHaveTextContent('Selected value: None');

    // Test selection
    await userEvent.click(trigger);
    const reactOption = await waitFor(() =>
      within(document.body).getByRole('option', { name: 'React' })
    );
    await userEvent.click(reactOption);

    await waitFor(() => {
      expect(selectedValue).toHaveTextContent('Selected value: react');
      expect(trigger).toHaveTextContent('React');
    });

    // Test clearing
    await userEvent.click(clearButton);
    await waitFor(() => {
      expect(selectedValue).toHaveTextContent('Selected value: None');
    });
  },
};

// Interaction testing
export const InteractionTest: Story = {
  render: () => (
    <Select placeholder="Test keyboard navigation">
      <Select.Item value="first">First Option</Select.Item>
      <Select.Item value="second">Second Option</Select.Item>
      <Select.Item value="third">Third Option</Select.Item>
    </Select>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('combobox');

    // Test keyboard opening
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    // Test arrow key navigation - navigate to second option
    await userEvent.keyboard('{ArrowDown}');
    const secondOption = await waitFor(() =>
      within(document.body).getByRole('option', { name: 'Second Option' })
    );
    expect(secondOption).toBeInTheDocument();

    // Test selection with Enter
    await userEvent.keyboard('{Enter}');
    expect(trigger).toHaveTextContent('Second Option');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  },
};

// React Hook Form integration
export const ReactHookFormIntegration: Story = {
  render: () => {
    const {
      register,
      handleSubmit,
      watch,
      setValue,
      formState: { errors },
    } = useForm({
      defaultValues: {
        country: '',
        language: 'javascript',
      },
    });

    const watchCountry = watch('country');
    const watchLanguage = watch('language');

    const onSubmit = (data: any) => {
      alert(`Form submitted: ${JSON.stringify(data, null, 2)}`);
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: '300px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormField error={errors.country?.message} required>
            <FormField.Label htmlFor="rhf-country">Country</FormField.Label>
            <FormField.Select
              id="rhf-country"
              placeholder="Select your country"
              value={watchCountry}
              onValueChange={(value) =>
                setValue('country', value, { shouldValidate: true })
              }
              {...register('country', {
                required: 'Please select a country',
              })}
            >
              <Select.Group label="North America">
                <Select.Item value="us">United States</Select.Item>
                <Select.Item value="ca">Canada</Select.Item>
              </Select.Group>
              <Select.Group label="Europe">
                <Select.Item value="uk">United Kingdom</Select.Item>
                <Select.Item value="fr">France</Select.Item>
                <Select.Item value="de">Germany</Select.Item>
              </Select.Group>
            </FormField.Select>
          </FormField>

          <FormField>
            <FormField.Label htmlFor="rhf-language">
              Programming Language
            </FormField.Label>
            <FormField.Select
              id="rhf-language"
              value={watchLanguage}
              {...register('language')}
              onValueChange={(value) => setValue('language', value)}
            >
              <Select.Item value="javascript">JavaScript</Select.Item>
              <Select.Item value="typescript">TypeScript</Select.Item>
              <Select.Item value="python">Python</Select.Item>
              <Select.Item value="java">Java</Select.Item>
            </FormField.Select>
          </FormField>

          <Button type="submit">Submit Form</Button>
        </div>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test pre-filled language field
    const languageSelect = canvas.getAllByRole('combobox')[1];
    expect(languageSelect).toHaveTextContent('JavaScript');

    // Test form submission without required field - should show validation error
    const submitButton = canvas.getByRole('button', { name: 'Submit Form' });
    await userEvent.click(submitButton);

    // Wait for validation error to appear
    await waitFor(() => {
      const errorMessage = canvas.getByText('Please select a country');
      expect(errorMessage).toBeInTheDocument();
    });

    // Test that country field is marked as invalid
    const countrySelect = canvas.getAllByRole('combobox')[0];
    expect(countrySelect).toHaveAttribute('aria-invalid', 'true');

    // Now select a country and test successful submission
    await userEvent.click(countrySelect);

    // Wait for dropdown to open and options to appear
    await waitFor(() => {
      expect(within(document.body).getByRole('listbox')).toBeInTheDocument();
    });

    const usOption = await waitFor(() =>
      within(document.body).getByRole('option', { name: 'United States' })
    );
    await userEvent.click(usOption);

    // Wait for error to clear
    await waitFor(() => {
      expect(
        canvas.queryByText('Please select a country')
      ).not.toBeInTheDocument();
    });

    // Test that country field is no longer invalid
    await waitFor(
      () => {
        // React Hook Form may set aria-invalid to false or remove it entirely
        const ariaInvalid = countrySelect.getAttribute('aria-invalid');
        expect(ariaInvalid === 'false' || ariaInvalid === null).toBe(true);
      },
      { timeout: 3000 }
    );

    // Test form submission with valid data
    await userEvent.click(submitButton);

    // Form should submit successfully (alert will be shown in browser)
  },
};
