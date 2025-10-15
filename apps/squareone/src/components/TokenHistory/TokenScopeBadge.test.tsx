import React from 'react';
import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import { TokenScopeBadge } from './TokenScopeBadge';

describe('TokenScopeBadge', () => {
  describe('scope color mapping', () => {
    test('renders exec scope with red color', () => {
      render(<TokenScopeBadge scope="exec:notebook" />);
      const badge = screen.getByText('exec:notebook');
      expect(badge).toBeInTheDocument();
      // Badge component applies color via CSS classes
      expect(badge.className).toContain('red');
    });

    test('renders read scope with green color', () => {
      render(<TokenScopeBadge scope="read:tap" />);
      const badge = screen.getByText('read:tap');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('green');
    });

    test('renders write scope with yellow color', () => {
      render(<TokenScopeBadge scope="write:tap" />);
      const badge = screen.getByText('write:tap');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('yellow');
    });

    test('renders unknown scope with gray color', () => {
      render(<TokenScopeBadge scope="admin:something" />);
      const badge = screen.getByText('admin:something');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('gray');
    });

    test('renders scope without prefix as gray', () => {
      render(<TokenScopeBadge scope="custom-scope" />);
      const badge = screen.getByText('custom-scope');
      expect(badge).toBeInTheDocument();
      expect(badge.className).toContain('gray');
    });
  });

  describe('size variations', () => {
    test('renders with small size', () => {
      render(<TokenScopeBadge scope="read:tap" size="sm" />);
      const badge = screen.getByText('read:tap');
      expect(badge.className).toContain('sm');
    });

    test('renders with medium size', () => {
      render(<TokenScopeBadge scope="read:tap" size="md" />);
      const badge = screen.getByText('read:tap');
      expect(badge.className).toContain('md');
    });

    test('renders with large size', () => {
      render(<TokenScopeBadge scope="read:tap" size="lg" />);
      const badge = screen.getByText('read:tap');
      expect(badge.className).toContain('lg');
    });

    test('defaults to small size when not specified', () => {
      render(<TokenScopeBadge scope="read:tap" />);
      const badge = screen.getByText('read:tap');
      expect(badge.className).toContain('sm');
    });
  });

  describe('variant override', () => {
    test('renders with soft variant', () => {
      render(<TokenScopeBadge scope="read:tap" variant="soft" />);
      const badge = screen.getByText('read:tap');
      expect(badge.className).toContain('soft');
    });

    test('renders with outline variant', () => {
      render(<TokenScopeBadge scope="read:tap" variant="outline" />);
      const badge = screen.getByText('read:tap');
      expect(badge.className).toContain('outline');
    });

    test('renders with solid variant', () => {
      render(<TokenScopeBadge scope="read:tap" variant="solid" />);
      const badge = screen.getByText('read:tap');
      expect(badge.className).toContain('solid');
    });

    test('defaults to soft variant when not specified', () => {
      render(<TokenScopeBadge scope="read:tap" />);
      const badge = screen.getByText('read:tap');
      expect(badge.className).toContain('soft');
    });
  });

  describe('children prop', () => {
    test('renders custom content when children provided', () => {
      render(
        <TokenScopeBadge scope="read:tap">
          <span>+ read:tap</span>
        </TokenScopeBadge>
      );
      expect(screen.getByText('+ read:tap')).toBeInTheDocument();
      // Scope text should not be rendered when children is provided
      expect(screen.queryByText('read:tap')).not.toBeInTheDocument();
    });

    test('renders scope text when children not provided', () => {
      render(<TokenScopeBadge scope="read:tap" />);
      expect(screen.getByText('read:tap')).toBeInTheDocument();
    });

    test('applies correct color even when using custom children', () => {
      const { container } = render(
        <TokenScopeBadge scope="exec:notebook">
          <span>Custom Content</span>
        </TokenScopeBadge>
      );
      // Get the inner span, then its parent (the Badge)
      const innerSpan = screen.getByText('Custom Content');
      const badge = innerSpan.parentElement;
      // Color is still based on scope prop, not children
      expect(badge?.className).toContain('red');
    });
  });

  describe('default behavior', () => {
    test('renders with full radius', () => {
      render(<TokenScopeBadge scope="read:tap" />);
      const badge = screen.getByText('read:tap');
      expect(badge.className).toContain('radiusFull');
    });

    test('renders as span element', () => {
      const { container } = render(<TokenScopeBadge scope="read:tap" />);
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('integration with Badge component', () => {
    test('combines all props correctly', () => {
      render(
        <TokenScopeBadge scope="exec:notebook" size="lg" variant="outline">
          Custom
        </TokenScopeBadge>
      );
      const badge = screen.getByText('Custom');
      expect(badge.className).toContain('red'); // exec: prefix
      expect(badge.className).toContain('outline'); // variant
      expect(badge.className).toContain('lg'); // size
      expect(badge.className).toContain('radiusFull'); // default radius
    });
  });
});
