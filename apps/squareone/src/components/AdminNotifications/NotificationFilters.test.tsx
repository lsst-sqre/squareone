import type { AdminNotificationFilters } from '@lsst-sqre/semaphore-client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import NotificationFilters from './NotificationFilters';

function renderFilters(
  overrides: Partial<{
    filters: AdminNotificationFilters;
    onFilterChange: (partial: Partial<AdminNotificationFilters>) => void;
    onClearFilters: () => void;
  }> = {}
) {
  const props = {
    filters: {} as AdminNotificationFilters,
    onFilterChange: vi.fn(),
    onClearFilters: vi.fn(),
    ...overrides,
  };
  render(
    <NotificationFilters
      filters={props.filters}
      onFilterChange={props.onFilterChange}
      onClearFilters={props.onClearFilters}
    />
  );
  return props;
}

describe('NotificationFilters', () => {
  it('renders recipient, sender, and date-range controls', () => {
    renderFilters();

    expect(screen.getByLabelText(/filter by recipient/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by sender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by end date/i)).toBeInTheDocument();
  });

  it('seeds the recipient and sender inputs from the current filters', () => {
    renderFilters({ filters: { recipient: 'alice', sender: 'ops-runbook' } });

    expect(screen.getByLabelText(/filter by recipient/i)).toHaveValue('alice');
    expect(screen.getByLabelText(/filter by sender/i)).toHaveValue(
      'ops-runbook'
    );
  });

  it('reports recipient input changes', async () => {
    const user = userEvent.setup();
    const { onFilterChange } = renderFilters();

    await user.type(screen.getByLabelText(/filter by recipient/i), 'a');

    expect(onFilterChange).toHaveBeenCalledWith({ recipient: 'a' });
  });

  it('reports sender input changes', async () => {
    const user = userEvent.setup();
    const { onFilterChange } = renderFilters();

    await user.type(screen.getByLabelText(/filter by sender/i), 'b');

    expect(onFilterChange).toHaveBeenCalledWith({ sender: 'b' });
  });

  it('clears the recipient filter when the input is emptied', async () => {
    const user = userEvent.setup();
    const { onFilterChange } = renderFilters({
      filters: { recipient: 'alice' },
    });

    await user.clear(screen.getByLabelText(/filter by recipient/i));

    expect(onFilterChange).toHaveBeenCalledWith({ recipient: undefined });
  });

  it('invokes the clear-all handler', async () => {
    const user = userEvent.setup();
    const { onClearFilters } = renderFilters({
      filters: { recipient: 'alice' },
    });

    await user.click(
      screen.getByRole('button', { name: /clear all filters/i })
    );

    expect(onClearFilters).toHaveBeenCalled();
  });
});
