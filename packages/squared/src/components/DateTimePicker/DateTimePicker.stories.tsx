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
The DateTimePicker component provides a comprehensive interface for selecting timestamps with timezone support. It combines an editable ISO8601 text input with a calendar popover, time controls, and timezone selection.

**Note:** This component always produces full ISO8601 timestamps (date + time + timezone). For date-only selection without time, use the DatePicker component instead.

## Features

- **ISO8601 Text Input**: Direct text entry with real-time validation
- **Calendar Popover**: Visual date selection with month navigation
- **Time Controls**: Always visible spinbox inputs for hours, minutes, and optional seconds
- **Timezone Support**: Auto-detection with manual override options
- **Date Constraints**: Min/max date boundaries
- **Accessibility**: Full keyboard navigation and screen reader support

## Usage

The component accepts an ISO8601 timestamp string as its value and calls the onChange handler with the updated ISO8601 timestamp string whenever the user makes changes.
        `,
      },
    },
  },
  argTypes: {
    defaultValue: {
      control: { type: 'text' },
      description: 'Initial value as ISO8601 string',
    },
    onChange: {
      action: 'changed',
      description: 'Called when the value changes with ISO8601 string',
    },
    defaultTimezone: {
      control: { type: 'select' },
      options: [
        'local',
        'UTC',
        'America/New_York',
        'America/Chicago',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
      ],
      description:
        "IANA timezone identifier, 'UTC', or 'local' for browser timezone (default: 'local')",
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
  const [value, setValue] = useState<string>(props.defaultValue || '');
  const [timezone, setTimezone] = useState(props.defaultTimezone || 'local');

  return (
    <DateTimePicker
      {...props}
      defaultValue={value}
      onChange={(iso) => {
        setValue(iso);
        if (props.onChange) {
          props.onChange(iso);
        }
      }}
      defaultTimezone={timezone}
      onTimezoneChange={(tz) => {
        setTimezone(tz);
        if (props.onTimezoneChange) {
          props.onTimezoneChange(tz);
        }
      }}
    />
  );
};

export const Default: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    defaultValue: null,
    placeholder: 'Select date and time',
    // defaultTimezone defaults to 'local' (browser timezone)
    // showTimezone defaults to true
  },
};

export const WithSeconds: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    defaultValue: '2024-03-15T14:30:45Z',
    showSeconds: true,
    placeholder: 'Select date and time with seconds',
  },
};

export const UTCOnly: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    defaultValue: '2024-03-15T14:30:00Z',
    defaultTimezone: 'UTC',
    showTimezone: false,
    placeholder: 'Select date and time (UTC)',
  },
};

export const WithConstraints: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    defaultValue: '2024-03-15T14:30:00Z',
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
    defaultValue: '2024-03-15T14:30:00-08:00',
    defaultTimezone: 'America/Los_Angeles',
    placeholder: 'Select date and time in Pacific timezone',
  },
};

export const Disabled: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    defaultValue: '2024-03-15T14:30:00Z',
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
          defaultValue="2024-03-15T14:30:00Z"
          size="sm"
          placeholder="Small size"
          onChange={() => {}}
        />
      </div>
      <div>
        <h4>Medium (Default)</h4>
        <ControlledDateTimePicker
          defaultValue="2024-03-15T14:30:00Z"
          size="md"
          placeholder="Medium size"
          onChange={() => {}}
        />
      </div>
      <div>
        <h4>Large</h4>
        <ControlledDateTimePicker
          defaultValue="2024-03-15T14:30:00Z"
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
    defaultValue: '2024-03-15T14:30:00Z',
    fullWidth: true,
    placeholder: 'Full width date picker',
  },
};

export const Empty: Story = {
  render: (args: React.ComponentProps<typeof DateTimePicker>) => (
    <ControlledDateTimePicker {...args} />
  ),
  args: {
    defaultValue: null,
    placeholder: 'YYYY-MM-DDTHH:mmZ',
  },
};

export const WithValidationError: Story = {
  render: () => {
    const [value, setValue] = useState<string>('');

    return (
      <DateTimePicker
        key={value}
        defaultValue={value}
        onChange={(iso) => setValue(iso)}
        placeholder="Try entering an invalid date"
      />
    );
  },
};

export const FormIntegration: Story = {
  render: () => {
    const [formData, setFormData] = useState<{
      eventTimestamp: string;
      timezone: string;
    }>({
      eventTimestamp: '',
      timezone: 'local',
    });

    const handleDateChange = (iso: string) => {
      setFormData((prev) => ({ ...prev, eventTimestamp: iso }));
    };

    const handleTimezoneChange = (timezone: string) => {
      setFormData((prev) => ({ ...prev, timezone }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      alert(
        `Form submitted with:\nTimestamp: ${formData.eventTimestamp}\nTimezone: ${formData.timezone}`
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
            key={formData.eventTimestamp}
            defaultValue={formData.eventTimestamp}
            onChange={handleDateChange}
            defaultTimezone={formData.timezone}
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
          Timestamp: {formData.eventTimestamp || '(none)'}
          <br />
          Date object:{' '}
          {formData.eventTimestamp
            ? new Date(formData.eventTimestamp).toISOString()
            : '(none)'}
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
    const [value, setValue] = useState<string>('');
    const [timezone, setTimezone] = useState('local');
    const [showSeconds, setShowSeconds] = useState(false);
    const [showTimezone, setShowTimezone] = useState(true);
    const [disabled, setDisabled] = useState(false);

    const handleChange = (iso: string) => {
      setValue(iso);
    };

    return (
      <div style={{ display: 'flex', gap: '2rem' }}>
        <div>
          <h4>DateTimePicker</h4>
          <DateTimePicker
            key={timezone + showSeconds + showTimezone} // Force remount on config changes only
            defaultValue={value}
            onChange={handleChange}
            defaultTimezone={timezone}
            onTimezoneChange={setTimezone}
            showSeconds={showSeconds}
            showTimezone={showTimezone}
            disabled={disabled}
            placeholder="Select date and time"
          />
          <div
            style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#666' }}
          >
            <strong>Current value:</strong>
            <br />
            Timestamp: {value || '(empty)'}
            <br />
            Date object: {value ? new Date(value).toISOString() : '(empty)'}
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
                checked={showSeconds}
                onChange={(e) => setShowSeconds(e.target.checked)}
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
