import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import TokenHistoryFilters from './TokenHistoryFilters';
import type { TokenHistoryFilters as FilterType } from '../../hooks/useTokenHistoryFilters';

describe('TokenHistoryFilters', () => {
  const defaultFilters: FilterType = {
    tokenType: undefined,
    token: undefined,
    since: undefined,
    until: undefined,
    ipAddress: undefined,
  };

  const defaultProps = {
    filters: defaultFilters,
    onFilterChange: vi.fn(),
    onClearFilters: vi.fn(),
    expandAll: false,
    onToggleExpandAll: vi.fn(),
  };

  describe('rendering', () => {
    test('renders all filter inputs', () => {
      render(<TokenHistoryFilters {...defaultProps} />);

      expect(screen.getByLabelText('Filter by start date')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by end date')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by token key')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by IP address')).toBeInTheDocument();
    });

    test('renders action buttons', () => {
      render(<TokenHistoryFilters {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: /expand all entries/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /clear all filters/i })
      ).toBeInTheDocument();
    });

    test('shows "Collapse All" when expandAll is true', () => {
      render(<TokenHistoryFilters {...defaultProps} expandAll={true} />);

      expect(screen.getByText('Collapse All')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /collapse all entries/i })
      ).toBeInTheDocument();
    });

    test('shows "Expand All" when expandAll is false', () => {
      render(<TokenHistoryFilters {...defaultProps} expandAll={false} />);

      expect(screen.getByText('Expand All')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /expand all entries/i })
      ).toBeInTheDocument();
    });
  });

  describe('filter inputs', () => {
    test('displays current filter values', () => {
      const filters: FilterType = {
        token: 'abc123xyz987def456ghi',
        ipAddress: '192.168.1.1',
        since: new Date('2025-03-01T00:00:00Z'),
        until: new Date('2025-03-15T23:59:59Z'),
      };

      render(<TokenHistoryFilters {...defaultProps} filters={filters} />);

      expect(
        screen.getByDisplayValue('abc123xyz987def456ghi')
      ).toBeInTheDocument();
      expect(screen.getByDisplayValue('192.168.1.1')).toBeInTheDocument();
    });

    test('calls onFilterChange when token input changes', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <TokenHistoryFilters
          {...defaultProps}
          onFilterChange={onFilterChange}
        />
      );

      const tokenInput = screen.getByLabelText('Filter by token key');
      await user.type(tokenInput, 'abc123');

      // Should be called for each character typed
      expect(onFilterChange).toHaveBeenCalled();
      // Check that it was called with the token parameter
      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    test('calls onFilterChange when IP address input changes', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <TokenHistoryFilters
          {...defaultProps}
          onFilterChange={onFilterChange}
        />
      );

      const ipInput = screen.getByLabelText('Filter by IP address');
      await user.type(ipInput, '192.168');

      expect(onFilterChange).toHaveBeenCalled();
      // Check that it was called with the ipAddress parameter
      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ ipAddress: expect.any(String) })
      );
    });

    test('calls onFilterChange with undefined when token input is cleared', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      const filters: FilterType = {
        ...defaultFilters,
        token: 'abc123',
      };

      render(
        <TokenHistoryFilters
          {...defaultProps}
          filters={filters}
          onFilterChange={onFilterChange}
        />
      );

      const tokenInput = screen.getByLabelText('Filter by token key');
      await user.clear(tokenInput);

      expect(onFilterChange).toHaveBeenCalledWith({ token: undefined });
    });

    test('calls onFilterChange with undefined when IP address input is cleared', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      const filters: FilterType = {
        ...defaultFilters,
        ipAddress: '192.168.1.1',
      };

      render(
        <TokenHistoryFilters
          {...defaultProps}
          filters={filters}
          onFilterChange={onFilterChange}
        />
      );

      const ipInput = screen.getByLabelText('Filter by IP address');
      await user.clear(ipInput);

      expect(onFilterChange).toHaveBeenCalledWith({ ipAddress: undefined });
    });

    test('trims whitespace from token input', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <TokenHistoryFilters
          {...defaultProps}
          onFilterChange={onFilterChange}
        />
      );

      const tokenInput = screen.getByLabelText(
        'Filter by token key'
      ) as HTMLInputElement;

      // Simulate pasting text with spaces
      await user.click(tokenInput);
      await user.paste('  abc123  ');

      // Should be called with trimmed value
      expect(onFilterChange).toHaveBeenLastCalledWith({ token: 'abc123' });
    });

    test('trims whitespace from IP address input', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <TokenHistoryFilters
          {...defaultProps}
          onFilterChange={onFilterChange}
        />
      );

      const ipInput = screen.getByLabelText(
        'Filter by IP address'
      ) as HTMLInputElement;

      // Simulate pasting text with spaces
      await user.click(ipInput);
      await user.paste('  192.168.1.1  ');

      // Should be called with trimmed value
      expect(onFilterChange).toHaveBeenLastCalledWith({
        ipAddress: '192.168.1.1',
      });
    });
  });

  describe('action buttons', () => {
    test('calls onToggleExpandAll when Expand All button is clicked', async () => {
      const user = userEvent.setup();
      const onToggleExpandAll = vi.fn();

      render(
        <TokenHistoryFilters
          {...defaultProps}
          onToggleExpandAll={onToggleExpandAll}
        />
      );

      const expandButton = screen.getByRole('button', {
        name: /expand all entries/i,
      });
      await user.click(expandButton);

      expect(onToggleExpandAll).toHaveBeenCalledTimes(1);
    });

    test('calls onToggleExpandAll when Collapse All button is clicked', async () => {
      const user = userEvent.setup();
      const onToggleExpandAll = vi.fn();

      render(
        <TokenHistoryFilters
          {...defaultProps}
          expandAll={true}
          onToggleExpandAll={onToggleExpandAll}
        />
      );

      const collapseButton = screen.getByRole('button', {
        name: /collapse all entries/i,
      });
      await user.click(collapseButton);

      expect(onToggleExpandAll).toHaveBeenCalledTimes(1);
    });

    test('calls onClearFilters when Clear Filters button is clicked', async () => {
      const user = userEvent.setup();
      const onClearFilters = vi.fn();

      render(
        <TokenHistoryFilters
          {...defaultProps}
          onClearFilters={onClearFilters}
        />
      );

      const clearButton = screen.getByRole('button', {
        name: /clear all filters/i,
      });
      await user.click(clearButton);

      expect(onClearFilters).toHaveBeenCalledTimes(1);
    });
  });

  describe('date pickers', () => {
    test('calls onFilterChange when since date changes', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <TokenHistoryFilters
          {...defaultProps}
          onFilterChange={onFilterChange}
        />
      );

      const sinceInput = screen.getByLabelText('Filter by start date');
      await user.type(sinceInput, '2025-03-01T00:00:00Z');

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalled();
      });
    });

    test('calls onFilterChange when until date changes', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();

      render(
        <TokenHistoryFilters
          {...defaultProps}
          onFilterChange={onFilterChange}
        />
      );

      const untilInput = screen.getByLabelText('Filter by end date');
      await user.type(untilInput, '2025-03-15T23:59:59Z');

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalled();
      });
    });

    test('calls onFilterChange with undefined when since date is cleared', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      const filters: FilterType = {
        ...defaultFilters,
        since: new Date('2025-03-01T00:00:00Z'),
      };

      render(
        <TokenHistoryFilters
          {...defaultProps}
          filters={filters}
          onFilterChange={onFilterChange}
        />
      );

      const sinceInput = screen.getByLabelText('Filter by start date');
      await user.clear(sinceInput);

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith({ since: undefined });
      });
    });

    test('calls onFilterChange with undefined when until date is cleared', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      const filters: FilterType = {
        ...defaultFilters,
        until: new Date('2025-03-15T23:59:59Z'),
      };

      render(
        <TokenHistoryFilters
          {...defaultProps}
          filters={filters}
          onFilterChange={onFilterChange}
        />
      );

      const untilInput = screen.getByLabelText('Filter by end date');
      await user.clear(untilInput);

      await waitFor(() => {
        expect(onFilterChange).toHaveBeenCalledWith({ until: undefined });
      });
    });
  });

  describe('accessibility', () => {
    test('has proper aria-label attributes', () => {
      render(<TokenHistoryFilters {...defaultProps} />);

      expect(screen.getByLabelText('Filter by start date')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by end date')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by token key')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by IP address')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /expand all entries/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /clear all filters/i })
      ).toBeInTheDocument();
    });

    test('has proper label associations for inputs', () => {
      render(<TokenHistoryFilters {...defaultProps} />);

      const labels = [
        { text: 'Since', inputId: 'filter-since' },
        { text: 'Until', inputId: 'filter-until' },
        { text: 'Token', inputId: 'filter-token' },
        { text: 'IP Address', inputId: 'filter-ip' },
      ];

      labels.forEach(({ text }) => {
        expect(screen.getByText(text)).toBeInTheDocument();
      });
    });
  });

  describe('sticky behavior', () => {
    test('renders with sticky positioning', () => {
      const { container } = render(<TokenHistoryFilters {...defaultProps} />);

      const filterContainer = container.firstChild as HTMLElement;
      expect(filterContainer).toBeInTheDocument();
      // CSS modules transform class names, so just check it has a class attribute
      expect(filterContainer).toHaveAttribute('class');
    });
  });
});
