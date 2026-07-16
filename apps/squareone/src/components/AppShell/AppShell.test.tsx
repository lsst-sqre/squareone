import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import AppShell from './AppShell';

test('renders a skip link targeting the main landmark', () => {
  render(<AppShell>content</AppShell>);

  const skipLink = screen.getByRole('link', {
    name: /skip to main content/i,
  });
  expect(skipLink).toHaveAttribute('href', '#main-content');
});

test('renders exactly one main landmark that wraps the children', () => {
  render(
    <AppShell>
      <p>page body</p>
    </AppShell>
  );

  const mains = screen.getAllByRole('main');
  expect(mains).toHaveLength(1);

  const main = mains[0];
  expect(main).toHaveAttribute('id', 'main-content');
  expect(main).toHaveAttribute('tabindex', '-1');
  expect(main).toHaveTextContent('page body');
});

test('the skip link is the first focusable element, before the chrome and main', () => {
  render(
    <AppShell
      chrome={
        <header>
          <a href="https://example.com/portal">Portal</a>
        </header>
      }
    >
      content
    </AppShell>
  );

  const skipLink = screen.getByRole('link', {
    name: /skip to main content/i,
  });
  const chromeLink = screen.getByRole('link', { name: 'Portal' });
  const main = screen.getByRole('main');

  // The skip link must precede both the chrome (header nav) and the main
  // landmark so it is the first Tab stop on the page.
  expect(
    skipLink.compareDocumentPosition(chromeLink) &
      Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  expect(
    skipLink.compareDocumentPosition(main) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
});
