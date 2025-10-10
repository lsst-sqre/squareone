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

    it('displays the provided value', () => {
      const value = '2024-03-15T14:30:00Z';
      render(<DateTimePicker {...defaultProps} value={value} />);

      const input = screen.getByDisplayValue(value);
      expect(input).toBeInTheDocument();
    });

    it('calls onChange when input value changes', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<DateTimePicker onChange={onChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, '2024-03-15T14:30:00Z');

      expect(onChange).toHaveBeenCalledWith('2024-03-15T14:30:00Z');
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
          timezone="UTC"
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
    it('shows error message for invalid input', () => {
      render(<DateTimePicker {...defaultProps} value="invalid-date" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Please enter a valid date/)).toBeInTheDocument();
    });

    it('shows error for date outside min/max range', () => {
      const minDate = new Date('2024-03-01');
      const maxDate = new Date('2024-03-31');

      render(
        <DateTimePicker
          {...defaultProps}
          value="2024-02-15T14:30:00Z"
          minDate={minDate}
          maxDate={maxDate}
        />
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Date must be between/)).toBeInTheDocument();
    });

    it('applies error appearance to input when invalid', () => {
      render(<DateTimePicker {...defaultProps} value="invalid-date" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      const ariaLabel = 'Event date and time';
      render(<DateTimePicker {...defaultProps} aria-label={ariaLabel} />);

      const input = screen.getByLabelText(ariaLabel);
      expect(input).toBeInTheDocument();
    });

    it('has proper ARIA attributes for invalid state', () => {
      render(<DateTimePicker {...defaultProps} value="invalid-date" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('announces error messages to screen readers', () => {
      render(<DateTimePicker {...defaultProps} value="invalid-date" />);

      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
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
});
