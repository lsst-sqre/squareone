import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Card from './Card';

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Content</Card>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders as an article element', () => {
    render(<Card>Content</Card>);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-class">Content</Card>);
    const article = screen.getByRole('article');
    expect(article).toHaveClass('custom-class');
  });
});
