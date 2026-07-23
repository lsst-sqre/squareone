import type { ReactElement } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the raw MDX loader so we can simulate a missing file (throws
// "MDX file not found: ...") versus a present file whose source then fails to
// compile.
vi.mock('../../config/rsc', () => ({
  getMdxContent: vi.fn(),
}));

// Mock the MDX compiler so a syntax error can be simulated without a real MDX
// build, and a success path can return a placeholder element.
vi.mock('next-mdx-remote/rsc', () => ({
  compileMDX: vi.fn(),
}));

import { compileMDX } from 'next-mdx-remote/rsc';
import { getMdxContent } from '../../config/rsc';
import { compileFooterMdxForRsc } from './compiler';

const mockedGetMdxContent = vi.mocked(getMdxContent);
const mockedCompileMDX = vi.mocked(compileMDX);

describe('compileFooterMdxForRsc', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns null silently when the footer MDX file is missing', async () => {
    const reportError = vi.fn();
    mockedGetMdxContent.mockRejectedValue(
      new Error('MDX file not found: /content/footer.mdx')
    );

    const result = await compileFooterMdxForRsc({ reportError });

    expect(result).toBeNull();
    // A missing (optional) footer file is expected — it must not be reported.
    expect(reportError).not.toHaveBeenCalled();
  });

  test('returns null AND reports when the footer MDX fails to compile', async () => {
    const reportError = vi.fn();
    mockedGetMdxContent.mockResolvedValue('# Footer <broken');
    const compileError = new Error('Could not parse expression with acorn');
    mockedCompileMDX.mockRejectedValue(compileError);

    const result = await compileFooterMdxForRsc({ reportError });

    // Footer still degrades gracefully to null...
    expect(result).toBeNull();
    // ...but a real MDX syntax error is surfaced.
    expect(reportError).toHaveBeenCalledTimes(1);
    const [reported, context] = reportError.mock.calls[0];
    expect(reported).toBe(compileError);
    expect(context).toMatchObject({ site: 'footer-mdx' });
  });

  test('returns the compiled content on success', async () => {
    const reportError = vi.fn();
    const element = { type: 'div' } as unknown as ReactElement;
    mockedGetMdxContent.mockResolvedValue('# Footer');
    mockedCompileMDX.mockResolvedValue({
      content: element,
      // biome-ignore lint/suspicious/noExplicitAny: test stub for compileMDX's return shape
    } as any);

    const result = await compileFooterMdxForRsc({ reportError });

    expect(result).toBe(element);
    expect(reportError).not.toHaveBeenCalled();
  });
});
