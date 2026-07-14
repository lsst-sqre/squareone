import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import ErrorPage from './error';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

test('does not render its own main landmark', () => {
  // error.tsx renders in place of {children} inside the root layout's single
  // <main>, so it must not declare its own (duplicate) main landmark.
  render(<ErrorPage error={new Error('boom')} reset={vi.fn()} />);

  expect(screen.queryByRole('main')).not.toBeInTheDocument();
});

test('renders the error heading', () => {
  render(<ErrorPage error={new Error('boom')} reset={vi.fn()} />);

  expect(
    screen.getByRole('heading', { name: /something went wrong/i })
  ).toBeInTheDocument();
});

test('moves focus to the error heading when it renders', () => {
  // When the boundary renders, focus should land on the heading so screen
  // reader and keyboard users are informed the page changed to an error state.
  render(<ErrorPage error={new Error('boom')} reset={vi.fn()} />);

  const heading = screen.getByRole('heading', {
    name: /something went wrong/i,
  });
  expect(heading).toHaveFocus();
});
