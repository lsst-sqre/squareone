import { faHome } from '@fortawesome/free-solid-svg-icons';
import { fireEvent, render, screen } from '@testing-library/react';
import { Home } from 'react-feather';
import { describe, expect, it, vi } from 'vitest';
import Button from './Button';

describe('Button', () => {
  describe('Basic rendering', () => {
    it('renders button with text', () => {
      render(<Button>Click me</Button>);
      expect(
        screen.getByRole('button', { name: /click me/i })
      ).toBeInTheDocument();
    });

    it('renders as a link when as="a" is provided', () => {
      render(
        <Button as="a" href="https://example.com">
          Link Button
        </Button>
      );
      const link = screen.getByRole('link', { name: /link button/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });

  describe('Variant prop', () => {
    it('applies primary variant correctly', () => {
      const { container } = render(<Button variant="primary">Primary</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('solid', 'primary');
    });

    it('applies secondary variant correctly', () => {
      const { container } = render(
        <Button variant="secondary">Secondary</Button>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('outline', 'secondary');
    });

    it('applies danger variant correctly', () => {
      const { container } = render(<Button variant="danger">Danger</Button>);
      const button = container.querySelector('button');
      expect(button).toHaveClass('solid', 'danger');
    });
  });

  describe('Appearance and tone props', () => {
    it('applies appearance and tone classes', () => {
      const { container } = render(
        <Button appearance="outline" tone="tertiary">
          Outline Tertiary
        </Button>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('outline', 'tertiary');
    });

    it('appearance and tone override variant prop', () => {
      const { container } = render(
        <Button appearance="text" tone="danger">
          Override
        </Button>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('text', 'danger');
      expect(button).not.toHaveClass('solid', 'primary');
    });
  });

  describe('Size variations', () => {
    it('applies small size class', () => {
      const { container } = render(<Button size="sm">Small</Button>);
      expect(container.querySelector('button')).toHaveClass('sm');
    });

    it('applies medium size class by default', () => {
      const { container } = render(<Button>Medium</Button>);
      expect(container.querySelector('button')).toHaveClass('md');
    });

    it('applies large size class', () => {
      const { container } = render(<Button size="lg">Large</Button>);
      expect(container.querySelector('button')).toHaveClass('lg');
    });
  });

  describe('Block prop', () => {
    it('applies block class when block is true', () => {
      const { container } = render(<Button block>Block Button</Button>);
      expect(container.querySelector('button')).toHaveClass('block');
    });

    it('does not apply block class when block is false', () => {
      const { container } = render(
        <Button block={false}>Normal Button</Button>
      );
      expect(container.querySelector('button')).not.toHaveClass('block');
    });
  });

  describe('Icons', () => {
    it('renders FontAwesome leading icon', () => {
      render(<Button leadingIcon={faHome}>Home</Button>);
      const icon = document.querySelector('.leadingIcon svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders FontAwesome trailing icon', () => {
      render(<Button trailingIcon={faHome}>Home</Button>);
      const icon = document.querySelector('.trailingIcon svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders Feather leading icon', () => {
      render(<Button leadingIcon={Home}>Home</Button>);
      const icon = document.querySelector('.leadingIcon svg');
      expect(icon).toBeInTheDocument();
    });

    it('renders both leading and trailing icons', () => {
      render(
        <Button leadingIcon={faHome} trailingIcon={Home}>
          Both Icons
        </Button>
      );
      const leadingIcon = document.querySelector('.leadingIcon');
      const trailingIcon = document.querySelector('.trailingIcon');
      expect(leadingIcon).toBeInTheDocument();
      expect(trailingIcon).toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows loading state and disables button', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-busy', 'true');
      expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    });

    it('applies loading class when loading', () => {
      const { container } = render(<Button loading>Loading</Button>);
      expect(container.querySelector('button')).toHaveClass('loading');
    });

    it('hides icons when loading', () => {
      render(
        <Button loading leadingIcon={faHome} trailingIcon={Home}>
          Loading
        </Button>
      );
      expect(document.querySelector('.leadingIcon')).not.toBeInTheDocument();
      expect(document.querySelector('.trailingIcon')).not.toBeInTheDocument();
    });
  });

  describe('Event handlers', () => {
    it('calls onClick handler when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Custom className', () => {
    it('applies custom className along with component classes', () => {
      const { container } = render(
        <Button className="custom-class">Custom</Button>
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-class');
      expect(button).toHaveClass('button'); // Still has base class
    });
  });

  describe('Forwarded ref', () => {
    it('forwards ref to button element', () => {
      const ref = vi.fn();
      render(<Button ref={ref}>Button</Button>);
      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes when loading', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-busy', 'true');
    });

    it('preserves aria-label when provided', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      expect(screen.getByLabelText('Custom label')).toBeInTheDocument();
    });
  });
});
