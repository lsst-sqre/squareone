import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import GlobalError from './global-error';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

test('renders a main landmark', () => {
  // global-error.tsx replaces the root layout entirely when it renders, so it
  // must supply its own <main> landmark (the AppShell's single <main> is gone).
  render(<GlobalError error={new Error('boom')} reset={vi.fn()} />);

  expect(screen.getByRole('main')).toBeInTheDocument();
});

test('renders the error heading', () => {
  render(<GlobalError error={new Error('boom')} reset={vi.fn()} />);

  expect(
    screen.getByRole('heading', { name: /something went wrong/i })
  ).toBeInTheDocument();
});

test('moves focus to the error heading when it renders', () => {
  // Focus should land on the heading so keyboard and screen reader users are
  // told the page changed to an error state.
  render(<GlobalError error={new Error('boom')} reset={vi.fn()} />);

  const heading = screen.getByRole('heading', {
    name: /something went wrong/i,
  });
  expect(heading).toHaveFocus();
});
