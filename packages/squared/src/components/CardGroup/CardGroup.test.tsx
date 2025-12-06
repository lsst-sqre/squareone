import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CardGroup from './CardGroup';

describe('CardGroup', () => {
  it('renders children', () => {
    render(<CardGroup>Content</CardGroup>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CardGroup className="custom-class">Content</CardGroup>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders multiple children', () => {
    render(
      <CardGroup>
        <div>Card 1</div>
        <div>Card 2</div>
      </CardGroup>
    );
    expect(screen.getByText('Card 1')).toBeInTheDocument();
    expect(screen.getByText('Card 2')).toBeInTheDocument();
  });
});
