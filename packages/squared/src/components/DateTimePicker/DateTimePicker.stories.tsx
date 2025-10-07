import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import DateTimePicker from './DateTimePicker';

const meta: Meta<typeof DateTimePicker> = {
  title: 'Components/DateTimePicker',
  component: DateTimePicker,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The DateTimePicker component provides a comprehensive interface for selecting dates and times with timezone support. It combines an editable ISO8601 text input with a calendar popover, time controls, and timezone selection.

## Features

- **ISO8601 Text Input**: Direct text entry with real-time validation
- **Calendar Popover**: Visual date selection with month navigation
- **Time Controls**: Spinbox inputs for hours, minutes, and optional seconds
- **Timezone Support**: Auto-detection with manual override options
- **Date Constraints**: Min/max date boundaries
- **Accessibility**: Full keyboard navigation and screen reader support

## Usage

The component accepts an ISO8601 string as its value and calls the onChange handler with the updated ISO8601 string whenever the user makes changes.
        `,
      },
    },
  },
  argTypes: {
    value: {
      control: { type: 'text' },
      description: 'Current value as ISO8601 string',
    },
    onChange: {
      action: 'changed',
      description: 'Called when the value changes',
    },
    timezone: {
      control: { type: 'select' },
      options: [
        'UTC',
        'America/New_York',
        'America/Chicago',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
      ],
      description: 'IANA timezone identifier',
    },
    onTimezoneChange: {
      action: 'timezone-changed',
      description: 'Called when timezone changes',
    },
    minDate: {
      control: { type: 'date' },
      description: 'Minimum selectable date',
    },
    maxDate: {
      control: { type: 'date' },
      description: 'Maximum selectable date',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the component is disabled',
    },
    showTime: {
      control: { type: 'boolean' },
      description: 'Whether to show time selection',
    },
    showSeconds: {
      control: { type: 'boolean' },
      description: 'Whether to show seconds in time selection',
    },
    showTimezone: {
      control: { type: 'boolean' },
      description: 'Whether to show timezone selection',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Component size',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Whether to take full width of container',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Controlled component wrapper for stories
const ControlledDateTimePicker = (
  props: React.ComponentProps<typeof DateTimePicker>
) => {
  const [value, setValue] = useState(props.value || '');
  const [timezone, setTimezone] = useState(props.timezone || 'UTC');

  return (
    <DateTimePicker
      {...props}
      value={value}
      onChange={setValue}
      timezone={timezone}
      onTimezoneChange={setTimezone}
    />
  );
};

export const Default: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    value: '2024-03-15T14:30:00Z',
    placeholder: 'Select date and time',
  },
};

export const WithoutTime: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    value: '2024-03-15',
    showTime: false,
    placeholder: 'Select date',
  },
};

export const WithSeconds: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    value: '2024-03-15T14:30:45Z',
    showSeconds: true,
    placeholder: 'Select date and time with seconds',
  },
};

export const WithoutTimezone: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    value: '2024-03-15T14:30:00',
    showTimezone: false,
    placeholder: 'Select date and time',
  },
};

export const WithConstraints: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    value: '2024-03-15T14:30:00Z',
    minDate: new Date('2024-03-01'),
    maxDate: new Date('2024-03-31'),
    placeholder: 'Select date within March 2024',
  },
};

export const DifferentTimezone: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    value: '2024-03-15T14:30:00-08:00',
    timezone: 'America/Los_Angeles',
    placeholder: 'Select date and time in Pacific timezone',
  },
};

export const Disabled: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    value: '2024-03-15T14:30:00Z',
    disabled: true,
    placeholder: 'Disabled date picker',
  },
};

export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        alignItems: 'flex-start',
      }}
    >
      <div>
        <h4>Small</h4>
        <ControlledDateTimePicker
          value="2024-03-15T14:30:00Z"
          size="sm"
          placeholder="Small size"
          onChange={() => {}}
        />
      </div>
      <div>
        <h4>Medium (Default)</h4>
        <ControlledDateTimePicker
          value="2024-03-15T14:30:00Z"
          size="md"
          placeholder="Medium size"
          onChange={() => {}}
        />
      </div>
      <div>
        <h4>Large</h4>
        <ControlledDateTimePicker
          value="2024-03-15T14:30:00Z"
          size="lg"
          placeholder="Large size"
          onChange={() => {}}
        />
      </div>
    </div>
  ),
};

export const FullWidth: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <div style={{ width: '400px', border: '1px dashed #ccc', padding: '1rem' }}>
      <ControlledDateTimePicker {...args} />
    </div>
  ),
  args: {
    value: '2024-03-15T14:30:00Z',
    fullWidth: true,
    placeholder: 'Full width date picker',
  },
};

export const Empty: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    value: '',
    placeholder: 'YYYY-MM-DDTHH:mm:ssZ',
  },
};

export const WithValidationError: Story = {
  render: () => {
    const [value, setValue] = useState('invalid-date');

    return (
      <DateTimePicker
        value={value}
        onChange={setValue}
        placeholder="Try entering an invalid date"
      />
    );
  },
};

export const FormIntegration: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      eventDate: '2024-03-15T14:30:00Z',
      timezone: 'UTC',
    });

    const handleDateChange = (value: string) => {
      setFormData((prev) => ({ ...prev, eventDate: value }));
    };

    const handleTimezoneChange = (timezone: string) => {
      setFormData((prev) => ({ ...prev, timezone }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(
        `Form submitted with:\nDate: ${formData.eventDate}\nTimezone: ${formData.timezone}`
      );
    };

    return (
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '300px',
        }}
      >
        <div>
          <label
            htmlFor="event-date"
            style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 'bold',
            }}
          >
            Event Date & Time
          </label>
          <DateTimePicker
            value={formData.eventDate}
            onChange={handleDateChange}
            timezone={formData.timezone}
            onTimezoneChange={handleTimezoneChange}
            placeholder="Select event date and time"
            aria-label="Event date and time"
            fullWidth
          />
        </div>
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            background: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          Submit
        </button>
        <div style={{ fontSize: '0.875rem', color: '#666' }}>
          <strong>Current values:</strong>
          <br />
          Date: {formData.eventDate}
          <br />
          Timezone: {formData.timezone}
        </div>
      </form>
    );
  },
};

// Interactive testing story
export const InteractiveDemo: Story = {
  render: () => {
    const [value, setValue] = useState('2024-03-15T14:30:00Z');
    const [timezone, setTimezone] = useState('UTC');
    const [showTime, setShowTime] = useState(true);
    const [showSeconds, setShowSeconds] = useState(false);
    const [showTimezone, setShowTimezone] = useState(true);
    const [disabled, setDisabled] = useState(false);

    return (
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <h4>DateTimePicker</h4>
          <DateTimePicker
            value={value}
            onChange={setValue}
            timezone={timezone}
            onTimezoneChange={setTimezone}
            showTime={showTime}
            showSeconds={showSeconds}
            showTimezone={showTimezone}
            disabled={disabled}
            placeholder="Select date and time"
          />
          <div
            style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}
          >
            <strong>Current value:</strong> {value || '(empty)'}
          </div>
        </div>
        <div>
          <h4>Controls</h4>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <label>
              <input
                type="checkbox"
                checked={showTime}
                onChange={(e) => setShowTime(e.target.checked)}
              />{' '}
              Show Time
            </label>
            <label>
              <input
                type="checkbox"
                checked={showSeconds}
                onChange={(e) => setShowSeconds(e.target.checked)}
                disabled={!showTime}
              />{' '}
              Show Seconds
            </label>
            <label>
              <input
                type="checkbox"
                checked={showTimezone}
                onChange={(e) => setShowTimezone(e.target.checked)}
              />{' '}
              Show Timezone
            </label>
            <label>
              <input
                type="checkbox"
                checked={disabled}
                onChange={(e) => setDisabled(e.target.checked)}
              />{' '}
              Disabled
            </label>
            <button
              type="button"
              onClick={() => setValue('')}
              style={{ marginTop: '0.5rem', padding: '0.25rem 0.5rem' }}
            >
              Clear Value
            </button>
          </div>
        </div>
      </div>
    );
  },
};
