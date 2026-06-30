import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  markdownToPlainText,
  renderInlineMarkdown,
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

describe('renderInlineMarkdown', () => {
  it('keeps inline emphasis', () => {
    expect(renderInlineMarkdown('A **bold** word')).toContain(
      '<strong>bold</strong>'
    );
  });

  it('drops the block paragraph wrapper so the result is phrasing content', () => {
    const out = renderInlineMarkdown('A **bold** word');
    expect(out).not.toContain('<p>');
    expect(out).not.toContain('</p>');
  });

  it('flattens links to their text (no anchor element)', () => {
    const out = renderInlineMarkdown('See [the policy](https://example.com)');
    expect(out).not.toContain('<a');
    expect(out).not.toContain('example.com');
    expect(out).toContain('the policy');
  });

  it('strips dangerous raw HTML rather than reintroducing it', () => {
    // The sanitizing pipeline removes scripts; a naive tag-stripping regex could
    // splice `<scr<script>ipt>` back into `<script>`.
    const out = renderInlineMarkdown('hi <scr<script>ipt>alert(1)</script>');
    expect(out).not.toContain('<script');
  });

  it('returns an empty string for empty input', () => {
    expect(renderInlineMarkdown('')).toBe('');
    expect(renderInlineMarkdown('   ')).toBe('');
  });
});

describe('markdownToPlainText', () => {
  it('drops emphasis markers but keeps the text', () => {
    expect(markdownToPlainText('A **bold** word')).toBe('A bold word');
  });

  it('keeps link text and discards the URL', () => {
    expect(markdownToPlainText('See [the policy](https://example.com)')).toBe(
      'See the policy'
    );
  });

  it('collapses runs of whitespace and trims', () => {
    expect(markdownToPlainText('  spaced   out  ')).toBe('spaced out');
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
