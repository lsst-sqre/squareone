import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Each test loads a fresh copy of the scheduler so its cached import and
// pending pass start empty.
async function loadScheduler() {
  return import('./highlightScheduler');
}

describe('highlightScheduler', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.doUnmock('microlighter');
    vi.unstubAllGlobals();
  });

  it('resolves false without the Custom Highlight API', async () => {
    const { loadMicroLighter, scheduleHighlight } = await loadScheduler();
    await expect(loadMicroLighter()).resolves.toBe(false);
    await expect(scheduleHighlight()).resolves.toBe(false);
  });

  it('imports MicroLighter again after a failed import', async () => {
    vi.stubGlobal('CSS', { highlights: new Map() });
    let imports = 0;
    vi.doMock('microlighter', () => {
      imports += 1;
      if (imports === 1) throw new Error('chunk failed to load');
      return { highlightAll: vi.fn().mockResolvedValue([]) };
    });
    const { loadMicroLighter } = await loadScheduler();

    await expect(loadMicroLighter()).resolves.toBe(false);
    await expect(loadMicroLighter()).resolves.toBe(true);
    expect(imports).toBe(2);
  });

  it('highlights on the next scheduled pass after a failed import', async () => {
    vi.stubGlobal('CSS', { highlights: new Map() });
    const highlightAll = vi.fn().mockResolvedValue([]);
    let imports = 0;
    vi.doMock('microlighter', () => {
      imports += 1;
      if (imports === 1) throw new Error('chunk failed to load');
      return { highlightAll };
    });
    const { scheduleHighlight } = await loadScheduler();

    await expect(scheduleHighlight()).resolves.toBe(false);
    expect(highlightAll).not.toHaveBeenCalled();

    // The next CodeBlock to mount tries the import again.
    await expect(scheduleHighlight()).resolves.toBe(true);
    expect(highlightAll).toHaveBeenCalledTimes(1);
  });

  it('shares one highlight pass between calls made in the same tick', async () => {
    vi.stubGlobal('CSS', { highlights: new Map() });
    const highlightAll = vi.fn().mockResolvedValue([]);
    vi.doMock('microlighter', () => ({ highlightAll }));
    const { getHighlightPassCount, scheduleHighlight } = await loadScheduler();

    const passes = [
      scheduleHighlight(),
      scheduleHighlight(),
      scheduleHighlight(),
    ];
    await expect(Promise.all(passes)).resolves.toEqual([true, true, true]);

    expect(highlightAll).toHaveBeenCalledTimes(1);
    expect(getHighlightPassCount()).toBe(1);
  });

  it('scopes each pass to code inside CodeBlock wrappers', async () => {
    vi.stubGlobal('CSS', { highlights: new Map() });
    const highlightAll = vi.fn().mockResolvedValue([]);
    vi.doMock('microlighter', () => ({ highlightAll }));
    const { scheduleHighlight } = await loadScheduler();

    await scheduleHighlight();

    expect(highlightAll).toHaveBeenCalledWith({
      selector: '[data-sqr-code-block] > pre > code',
    });
  });

  it('runs a pass scheduled during another pass after it finishes', async () => {
    vi.stubGlobal('CSS', { highlights: new Map() });
    let finishFirstPass: (blocks: HTMLElement[]) => void = () => {};
    const highlightAll = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<HTMLElement[]>((resolve) => {
            finishFirstPass = resolve;
          })
      )
      .mockResolvedValue([]);
    vi.doMock('microlighter', () => ({ highlightAll }));
    const { scheduleHighlight } = await loadScheduler();

    const first = scheduleHighlight();
    await vi.waitFor(() => expect(highlightAll).toHaveBeenCalledTimes(1));

    // A block that mounts mid-pass gets a pass of its own, but only once the
    // running pass has finished, so the two never interleave.
    const second = scheduleHighlight();
    expect(scheduleHighlight()).toBe(second);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(highlightAll).toHaveBeenCalledTimes(1);

    finishFirstPass([]);
    await expect(first).resolves.toBe(true);
    await expect(second).resolves.toBe(true);
    expect(highlightAll).toHaveBeenCalledTimes(2);
  });
});
