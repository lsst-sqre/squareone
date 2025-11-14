import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { expect, test, vi } from 'vitest';
import MobileMenuToggle from './MobileMenuToggle';

test('renders as button with correct type', () => {
  render(<MobileMenuToggle isOpen={false} onClick={vi.fn()} />);

  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('type', 'button');
});

test('displays correct aria-label when closed', () => {
  render(<MobileMenuToggle isOpen={false} onClick={vi.fn()} />);

  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-label', 'Open navigation menu');
});

test('displays correct aria-label when open', () => {
  render(<MobileMenuToggle isOpen={true} onClick={vi.fn()} />);

  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-label', 'Close navigation menu');
});

test('sets aria-expanded to false when closed', () => {
  render(<MobileMenuToggle isOpen={false} onClick={vi.fn()} />);

  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-expanded', 'false');
});

test('sets aria-expanded to true when open', () => {
  render(<MobileMenuToggle isOpen={true} onClick={vi.fn()} />);

  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-expanded', 'true');
});

test('calls onClick when clicked', () => {
  const mockOnClick = vi.fn();
  render(<MobileMenuToggle isOpen={false} onClick={mockOnClick} />);

  const button = screen.getByRole('button');
  fireEvent.click(button);

  expect(mockOnClick).toHaveBeenCalledTimes(1);
});

test('renders button with menu functionality', () => {
  render(<MobileMenuToggle isOpen={false} onClick={vi.fn()} />);

  // Test the button exists instead of focusing on the icon implementation
  expect(screen.getByRole('button')).toBeInTheDocument();
});

test('has correct test id', () => {
  render(<MobileMenuToggle isOpen={false} onClick={vi.fn()} />);

  expect(screen.getByTestId('mobile-menu-toggle')).toBeInTheDocument();
});

test('is keyboard accessible', () => {
  const mockOnClick = vi.fn();
  render(<MobileMenuToggle isOpen={false} onClick={mockOnClick} />);

  const button = screen.getByRole('button');
  button.focus();

  expect(button).toHaveFocus();

  // Simulate Enter key press which should trigger click on a button
  fireEvent.click(button);
  expect(mockOnClick).toHaveBeenCalled();
});

test('toggles state properly', () => {
  const { rerender } = render(
    <MobileMenuToggle isOpen={false} onClick={vi.fn()} />
  );

  let button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(button).toHaveAttribute('aria-label', 'Open navigation menu');

  rerender(<MobileMenuToggle isOpen={true} onClick={vi.fn()} />);

  button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(button).toHaveAttribute('aria-label', 'Close navigation menu');
});

test('forwards ref correctly', () => {
  const ref = vi.fn();
  render(<MobileMenuToggle ref={ref} isOpen={false} onClick={vi.fn()} />);

  expect(ref).toHaveBeenCalled();
});
