import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { TokenScopeChangeBadge } from './TokenScopeChangeBadge';

describe('TokenScopeChangeBadge', () => {
  describe('added type', () => {
    test('renders scope text with added type', () => {
      render(<TokenScopeChangeBadge type="added" scope="read:tap" />);
      // Scope text is rendered
      expect(screen.getByText('read:tap')).toBeInTheDocument();
    });

    test('renders with soft variant', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="added" scope="read:tap" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('soft');
    });

    test('inherits color from TokenScopeBadge (exec scope)', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="added" scope="exec:notebook" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('red');
    });

    test('inherits color from TokenScopeBadge (read scope)', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="added" scope="read:tap" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('green');
    });

    test('inherits color from TokenScopeBadge (write scope)', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="added" scope="write:tap" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('yellow');
    });
  });

  describe('removed type', () => {
    test('renders scope text with removed type', () => {
      render(<TokenScopeChangeBadge type="removed" scope="read:tap" />);
      // Scope text is rendered
      expect(screen.getByText('read:tap')).toBeInTheDocument();
    });

    test('renders with outline variant', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="removed" scope="read:tap" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('outline');
    });

    test('inherits color from TokenScopeBadge (exec scope)', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="removed" scope="exec:notebook" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('red');
    });

    test('inherits color from TokenScopeBadge (read scope)', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="removed" scope="read:tap" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('green');
    });

    test('inherits color from TokenScopeBadge (write scope)', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="removed" scope="write:tap" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('yellow');
    });
  });

  describe('size variations', () => {
    test('renders with small size', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="added" scope="read:tap" size="sm" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('sm');
    });

    test('renders with medium size', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="added" scope="read:tap" size="md" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('md');
    });

    test('renders with large size', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="added" scope="read:tap" size="lg" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('lg');
    });

    test('defaults to small size when not specified', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="added" scope="read:tap" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('sm');
    });
  });

  describe('integration with TokenScopeBadge', () => {
    test('added variant uses soft variant with green color for read scope', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="added" scope="read:tap" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('soft');
      expect(badge?.className).toContain('green');
    });

    test('removed variant uses outline variant with red color for exec scope', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="removed" scope="exec:notebook" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('outline');
      expect(badge?.className).toContain('red');
    });

    test('combines size, variant, and color correctly', () => {
      const { container } = render(
        <TokenScopeChangeBadge type="removed" scope="write:tap" size="lg" />
      );
      const badge = container.querySelector('span');
      expect(badge?.className).toContain('outline'); // variant
      expect(badge?.className).toContain('yellow'); // write: prefix color
      expect(badge?.className).toContain('lg'); // size
    });
  });

  describe('scope text rendering', () => {
    test('displays scope text alongside icon for added type', () => {
      render(<TokenScopeChangeBadge type="added" scope="read:tap" />);
      expect(screen.getByText('read:tap')).toBeInTheDocument();
    });

    test('displays scope text alongside icon for removed type', () => {
      render(<TokenScopeChangeBadge type="removed" scope="exec:notebook" />);
      expect(screen.getByText('exec:notebook')).toBeInTheDocument();
    });
  });
});
