import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Note from './Note';

describe('Note', () => {
  it('renders children', () => {
    render(<Note>Content</Note>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('displays "Note" label by default', () => {
    render(<Note>Content</Note>);
    expect(screen.getByText('Note')).toBeInTheDocument();
  });

  it('displays "Warning" label for warning type', () => {
    render(<Note type="warning">Content</Note>);
    expect(screen.getByText('Warning')).toBeInTheDocument();
  });

  it('displays "Tip" label for tip type', () => {
    render(<Note type="tip">Content</Note>);
    expect(screen.getByText('Tip')).toBeInTheDocument();
  });

  it('displays "Info" label for info type', () => {
    render(<Note type="info">Content</Note>);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<Note className="custom-class">Content</Note>);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
