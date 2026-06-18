import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import RenderedMarkdown from './RenderedMarkdown';

describe('RenderedMarkdown', () => {
  it('renders Markdown as HTML in the DOM', () => {
    const { container } = render(
      <RenderedMarkdown markdown="A **bold** word" />
    );

    expect(container.querySelector('strong')?.textContent).toBe('bold');
  });

  it('renders GFM features', () => {
    const { container } = render(<RenderedMarkdown markdown="~~gone~~" />);

    expect(container.querySelector('del')?.textContent).toBe('gone');
  });

  it('applies a custom className alongside its base class', () => {
    const { container } = render(
      <RenderedMarkdown markdown="hi" className="custom" />
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toContain('custom');
  });
});
