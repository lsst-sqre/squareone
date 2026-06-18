import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  renderMarkdownToHtml,
  useRenderedMarkdown,
} from './useRenderedMarkdown';

describe('renderMarkdownToHtml', () => {
  it('renders inline Markdown to HTML', () => {
    expect(renderMarkdownToHtml('A **bold** word')).toContain(
      '<strong>bold</strong>'
    );
  });

  it('renders GFM strikethrough', () => {
    expect(renderMarkdownToHtml('~~gone~~')).toContain('<del>gone</del>');
  });

  it('renders GFM tables', () => {
    const markdown = ['| a | b |', '| - | - |', '| 1 | 2 |'].join('\n');
    expect(renderMarkdownToHtml(markdown)).toContain('<table>');
  });

  it('returns an empty string for empty input', () => {
    expect(renderMarkdownToHtml('')).toBe('');
    expect(renderMarkdownToHtml('   ')).toBe('');
  });
});

describe('useRenderedMarkdown', () => {
  it('returns the rendered HTML for the given Markdown', () => {
    const { result } = renderHook(() => useRenderedMarkdown('A **bold** word'));

    expect(result.current).toContain('<strong>bold</strong>');
  });

  it('updates the rendered HTML when the Markdown changes', () => {
    const { result, rerender } = renderHook(
      ({ markdown }) => useRenderedMarkdown(markdown),
      { initialProps: { markdown: 'first' } }
    );

    expect(result.current).toContain('first');

    rerender({ markdown: 'second' });

    expect(result.current).toContain('second');
  });
});
