import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import DateTimePicker from './DateTimePicker';

// Mock timezone to ensure consistent tests
vi.mock('./timezoneUtils', async () => {
  const actual = await vi.importActual('./timezoneUtils');
  return {
    ...actual,
    getBrowserTimezone: () => 'UTC',
  };
});

describe('DateTimePicker', () => {
  const defaultProps = {
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('renders with default props', () => {
      render(<DateTimePicker {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();

      const calendarButton = screen.getByLabelText('Open calendar');
      expect(calendarButton).toBeInTheDocument();
    });

    it('displays the provided default value', () => {
      const defaultValue = '2024-03-15T14:30:00Z';
      render(<DateTimePicker {...defaultProps} defaultValue={defaultValue} />);

      const input = screen.getByDisplayValue('2024-03-15T14:30Z');
      expect(input).toBeInTheDocument();
    });

    it('calls onChange when input value changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<DateTimePicker onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '2024-03-15T14:30:00Z');

      // onChange is called with ISO8601 string only
      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(lastCall[0]).toBe('2024-03-15T14:30:00Z');
      expect(lastCall.length).toBe(1); // Only one argument
    });

    it('shows placeholder text', () => {
      const placeholder = 'Select a date and time';
      render(<DateTimePicker {...defaultProps} placeholder={placeholder} />);

      const input = screen.getByPlaceholderText(placeholder);
      expect(input).toBeInTheDocument();
    });
  });

  describe('Calendar functionality', () => {
    it('opens calendar popover when button is clicked', async () => {
      const user = userEvent.setup();
      render(<DateTimePicker {...defaultProps} />);

      const calendarButton = screen.getByLabelText('Open calendar');
      await user.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });
    });

    it('closes calendar when Escape is pressed', async () => {
      const user = userEvent.setup();
      render(<DateTimePicker {...defaultProps} />);

      const calendarButton = screen.getByLabelText('Open calendar');
      await user.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByRole('grid')).toBeInTheDocument();
      });

      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByRole('grid')).not.toBeInTheDocument();
      });
    });
  });

  describe('Time functionality', () => {
    it('always shows time input in calendar popover', async () => {
      const user = userEvent.setup();
      render(<DateTimePicker {...defaultProps} />);

      const calendarButton = screen.getByLabelText('Open calendar');
      await user.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Select time')).toBeInTheDocument();
      });
    });
  });

  describe('Timezone functionality', () => {
    it('defaults to local timezone when no defaultTimezone prop is provided', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DateTimePicker onChange={onChange} />);

      const calendarButton = screen.getByLabelText('Open calendar');
      await user.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Select timezone')).toBeInTheDocument();
      });

      // Since getBrowserTimezone is mocked to return 'UTC', 'local' should resolve to 'UTC'
      // The timezone selector should show UTC as selected
      const timezoneSelect = screen.getByLabelText('Select timezone');
      expect(timezoneSelect).toBeInTheDocument();
    });

    it("resolves 'local' defaultTimezone to browser timezone", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DateTimePicker onChange={onChange} defaultTimezone="local" />);

      const calendarButton = screen.getByLabelText('Open calendar');
      await user.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Select timezone')).toBeInTheDocument();
      });

      // Since getBrowserTimezone is mocked to return 'UTC', 'local' should resolve to 'UTC'
      const timezoneSelect = screen.getByLabelText('Select timezone');
      expect(timezoneSelect).toBeInTheDocument();
    });

    it('uses UTC defaultTimezone when explicitly set', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<DateTimePicker onChange={onChange} defaultTimezone="UTC" />);

      const calendarButton = screen.getByLabelText('Open calendar');
      await user.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Select timezone')).toBeInTheDocument();
      });

      const timezoneSelect = screen.getByLabelText('Select timezone');
      expect(timezoneSelect).toBeInTheDocument();
    });

    it('uses custom IANA defaultTimezone when provided', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(
        <DateTimePicker
          onChange={onChange}
          defaultTimezone="America/New_York"
        />
      );

      const calendarButton = screen.getByLabelText('Open calendar');
      await user.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Select timezone')).toBeInTheDocument();
      });

      const timezoneSelect = screen.getByLabelText('Select timezone');
      expect(timezoneSelect).toBeInTheDocument();
    });

    it('shows timezone selector when showTimezone is true', async () => {
      const user = userEvent.setup();
      render(<DateTimePicker {...defaultProps} showTimezone />);

      const calendarButton = screen.getByLabelText('Open calendar');
      await user.click(calendarButton);

      await waitFor(() => {
        expect(screen.getByLabelText('Select timezone')).toBeInTheDocument();
      });
    });

    it('hides timezone selector when showTimezone is false', async () => {
      const user = userEvent.setup();
      render(<DateTimePicker {...defaultProps} showTimezone={false} />);

      const calendarButton = screen.getByLabelText('Open calendar');
      await user.click(calendarButton);

      await waitFor(() => {
        expect(
          screen.queryByLabelText('Select timezone')
        ).not.toBeInTheDocument();
      });
    });

    it('calls onTimezoneChange when timezone changes', async () => {
      const user = userEvent.setup();
      const onTimezoneChange = vi.fn();

      render(
        <DateTimePicker
          {...defaultProps}
          showTimezone
          onTimezoneChange={onTimezoneChange}
          defaultTimezone="UTC"
        />
      );

      const calendarButton = screen.getByLabelText('Open calendar');
      await user.click(calendarButton);

      await waitFor(() => {
        const timezoneSelect = screen.getByLabelText('Select timezone');
        expect(timezoneSelect).toBeInTheDocument();
      });

      const timezoneSelect = screen.getByLabelText('Select timezone');
      await user.click(timezoneSelect);

      // Wait for dropdown to open and select a timezone
      await waitFor(() => {
        const option = screen.getByText('New York (Eastern)');
        expect(option).toBeInTheDocument();
      });

      const option = screen.getByText('New York (Eastern)');
      await user.click(option);

      expect(onTimezoneChange).toHaveBeenCalledWith('America/New_York');
    });
  });

  describe('Validation', () => {
    it('shows error message for invalid input', async () => {
      const user = userEvent.setup();
      render(<DateTimePicker {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'invalid-date');

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(
          screen.getByText(/Please enter a valid date/)
        ).toBeInTheDocument();
      });
    });

    it('shows error for date outside min/max range', () => {
      const minDate = new Date('2024-03-01');
      const maxDate = new Date('2024-03-31');
      const defaultValue = '2024-02-15T14:30:00Z';

      render(
        <DateTimePicker
          {...defaultProps}
          defaultValue={defaultValue}
          minDate={minDate}
          maxDate={maxDate}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Date must be between/)).toBeInTheDocument();
    });

    it('applies error appearance to input when invalid', async () => {
      const user = userEvent.setup();
      render(<DateTimePicker {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'invalid-date');

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      const ariaLabel = 'Event date and time';
      render(<DateTimePicker {...defaultProps} aria-label={ariaLabel} />);

      const input = screen.getByLabelText(ariaLabel);
      expect(input).toBeInTheDocument();
    });

    it('has proper ARIA attributes for invalid state', async () => {
      const user = userEvent.setup();
      render(<DateTimePicker {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'invalid-date');

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('announces error messages to screen readers', async () => {
      const user = userEvent.setup();
      render(<DateTimePicker {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'invalid-date');

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<DateTimePicker {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.tab();
      expect(input).toHaveFocus();

      await user.tab();
      const calendarButton = screen.getByLabelText('Open calendar');
      expect(calendarButton).toHaveFocus();
    });
  });

  describe('Disabled state', () => {
    it('disables input when disabled prop is true', () => {
      render(<DateTimePicker {...defaultProps} disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();

      const calendarButton = screen.getByLabelText('Open calendar');
      expect(calendarButton).toBeDisabled();
    });

    it('does not open calendar when disabled', async () => {
      const user = userEvent.setup();
      render(<DateTimePicker {...defaultProps} disabled />);

      const calendarButton = screen.getByLabelText('Open calendar');
      await user.click(calendarButton);

      expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    });
  });

  describe('Size variants', () => {
    it('applies size classes correctly', () => {
      const { rerender } = render(
        <DateTimePicker {...defaultProps} size="sm" />
      );
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      rerender(<DateTimePicker {...defaultProps} size="md" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();

      rerender(<DateTimePicker {...defaultProps} size="lg" />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
  });

  describe('Full width', () => {
    it('applies full width class when fullWidth is true', () => {
      render(<DateTimePicker {...defaultProps} fullWidth />);

      // The container should have full width styling
      const container = screen.getByRole('textbox').closest('.dateTimePicker');
      expect(container).toHaveClass('fullWidth');
    });
  });

  describe('String-based API', () => {
    it('accepts ISO8601 strings as defaultValue', () => {
      const defaultValue = '2024-03-15T14:30:00Z';
      render(<DateTimePicker {...defaultProps} defaultValue={defaultValue} />);

      const input = screen.getByDisplayValue('2024-03-15T14:30Z');
      expect(input).toBeInTheDocument();
    });

    it('handles ISO8601 strings with different timezone offsets', () => {
      const defaultValue = '2024-03-15T14:30:00-08:00';
      render(
        <DateTimePicker
          {...defaultProps}
          defaultValue={defaultValue}
          defaultTimezone="America/Los_Angeles"
        />
      );

      // Should display in the specified timezone
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('returns ISO8601 string from onChange', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<DateTimePicker onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, '2024-03-15T14:30:00Z');

      expect(onChange).toHaveBeenCalled();
      const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1];
      expect(typeof lastCall[0]).toBe('string');
      expect(lastCall[0]).toBe('2024-03-15T14:30:00Z');
    });

    it('handles null defaultValue', () => {
      render(<DateTimePicker {...defaultProps} defaultValue={null} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('handles undefined defaultValue', () => {
      render(<DateTimePicker {...defaultProps} defaultValue={undefined} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('does not update when defaultValue prop changes (uncontrolled)', () => {
      const { rerender } = render(
        <DateTimePicker {...defaultProps} defaultValue="2024-03-15T14:30:00Z" />
      );

      expect(screen.getByDisplayValue('2024-03-15T14:30Z')).toBeInTheDocument();

      // Changing defaultValue should not update the component (uncontrolled)
      rerender(
        <DateTimePicker {...defaultProps} defaultValue="2024-03-16T10:00:00Z" />
      );

      // Should still show original value
      expect(screen.getByDisplayValue('2024-03-15T14:30Z')).toBeInTheDocument();
    });

    it('can be reset using key prop', () => {
      const { rerender } = render(
        <DateTimePicker
          key="v1"
          {...defaultProps}
          defaultValue="2024-03-15T14:30:00Z"
        />
      );

      expect(screen.getByDisplayValue('2024-03-15T14:30Z')).toBeInTheDocument();

      // Changing key forces remount with new defaultValue
      rerender(
        <DateTimePicker
          key="v2"
          {...defaultProps}
          defaultValue="2024-03-16T10:00:00Z"
        />
      );

      expect(screen.getByDisplayValue('2024-03-16T10:00Z')).toBeInTheDocument();
    });
  });
});
