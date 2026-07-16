import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import MainContent from './MainContent';

test('does not render its own main landmark', () => {
  // The single <main> landmark is owned by the root layout's AppShell.
  // MainContent is only a content wrapper inside that landmark.
  render(<MainContent>body</MainContent>);

  expect(screen.queryByRole('main')).not.toBeInTheDocument();
});

test('renders its children', () => {
  render(
    <MainContent>
      <p>hello</p>
    </MainContent>
  );

  expect(screen.getByText('hello')).toBeInTheDocument();
});
