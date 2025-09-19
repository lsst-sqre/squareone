import { render, screen } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders error message with proper ARIA attributes', () => {
    render(<ErrorMessage id="test-error" message="This is an error" />);

    const errorElement = screen.getByText('This is an error');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveAttribute('id', 'test-error');
    expect(errorElement).toHaveAttribute('role', 'status');
    expect(errorElement).toHaveAttribute('aria-live', 'polite');
    expect(errorElement).toHaveAttribute('aria-atomic', 'true');
  });

  it('reserves space when no message is provided with reserve-space strategy', () => {
    render(<ErrorMessage id="test-error" strategy="reserve-space" />);

    const errorElement = document.getElementById('test-error');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveAttribute('aria-hidden', 'true');
    expect(errorElement).toHaveClass('placeholder');
  });

  it('renders nothing when no message is provided with dynamic strategy', () => {
    const { container } = render(
      <ErrorMessage id="test-error" strategy="dynamic" />
    );

    expect(container.firstChild).toBeNull();
  });

  it('applies custom className', () => {
    render(
      <ErrorMessage
        id="test-error"
        message="Error message"
        className="custom-class"
      />
    );

    const errorElement = screen.getByText('Error message');
    expect(errorElement).toHaveClass('custom-class');
  });

  it('passes through additional props', () => {
    render(
      <ErrorMessage
        id="test-error"
        message="Error message"
        data-testid="error-message"
      />
    );

    const errorElement = screen.getByTestId('error-message');
    expect(errorElement).toBeInTheDocument();
  });

  it('defaults to reserve-space strategy when strategy is not provided', () => {
    render(<ErrorMessage id="test-error" />);

    const errorElement = document.getElementById('test-error');
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveAttribute('aria-hidden', 'true');
  });
});
