import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Label from './Label';

describe('Label', () => {
  it('renders label text correctly', () => {
    render(<Label>Email Address</Label>);

    const label = screen.getByText('Email Address');
    expect(label).toBeInTheDocument();
  });

  it('displays required indicator when required prop is true', () => {
    render(<Label required>Email Address</Label>);

    const requiredIndicator = screen.getByText('*');
    expect(requiredIndicator).toBeInTheDocument();
    expect(requiredIndicator).toHaveTextContent('*');
  });

  it('does not display required indicator when required prop is false', () => {
    render(<Label required={false}>Email Address</Label>);

    const requiredIndicator = screen.queryByText('*');
    expect(requiredIndicator).not.toBeInTheDocument();
  });

  it('applies disabled styling when disabled prop is true', () => {
    render(<Label disabled>Email Address</Label>);

    const label = screen.getByText('Email Address');
    expect(label).toHaveClass('disabled');
  });

  it('applies correct size class', () => {
    const { rerender } = render(<Label size="sm">Small Label</Label>);

    let label = screen.getByText('Small Label');
    expect(label).toHaveClass('sm');

    rerender(<Label size="lg">Large Label</Label>);
    label = screen.getByText('Large Label');
    expect(label).toHaveClass('lg');
  });

  it('defaults to medium size when no size prop is provided', () => {
    render(<Label>Default Label</Label>);

    const label = screen.getByText('Default Label');
    expect(label).toHaveClass('md');
  });

  it('applies custom className', () => {
    render(<Label className="custom-class">Styled Label</Label>);

    const label = screen.getByText('Styled Label');
    expect(label).toHaveClass('custom-class');
  });

  it('forwards htmlFor attribute for form control association', () => {
    render(<Label htmlFor="test-input">Test Label</Label>);

    const label = screen.getByText('Test Label');
    expect(label).toHaveAttribute('for', 'test-input');
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Label ref={ref}>Ref Test</Label>);

    expect(ref.current).toBeInstanceOf(HTMLLabelElement);
  });

  it('passes through additional props', () => {
    render(<Label data-testid="custom-label">Test Label</Label>);

    const label = screen.getByTestId('custom-label');
    expect(label).toBeInTheDocument();
  });

  it('focuses associated input when label is clicked', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <Label htmlFor="test-input">Test Label</Label>
        <input id="test-input" type="text" />
      </div>
    );

    const label = screen.getByText('Test Label');
    const input = screen.getByRole('textbox');

    await user.click(label);
    expect(input).toHaveFocus();
  });
});
