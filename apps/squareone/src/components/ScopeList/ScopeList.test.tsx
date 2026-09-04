import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import ScopeList from './ScopeList';

describe('ScopeList', () => {
  test('renders a single scope as one code element', () => {
    const { container } = render(<ScopeList scopes={['admin:token']} />);

    expect(screen.getByText('admin:token').tagName).toBe('CODE');
    expect(container.textContent).toBe('admin:token');
  });

  test('joins two scopes with "or"', () => {
    const { container } = render(
      <ScopeList scopes={['admin:token', 'exec:admin']} />
    );

    expect(container.textContent).toBe('admin:token or exec:admin');
  });

  test('joins three or more scopes with commas and a final "or"', () => {
    const { container } = render(
      <ScopeList scopes={['a:one', 'b:two', 'c:three']} />
    );

    expect(container.textContent).toBe('a:one, b:two, or c:three');
  });

  test('renders nothing when there are no scopes', () => {
    // A page configured with an empty scope list is unreachable by anyone, so
    // the gate has no scope to name; it must not render a dangling separator.
    const { container } = render(<ScopeList scopes={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
