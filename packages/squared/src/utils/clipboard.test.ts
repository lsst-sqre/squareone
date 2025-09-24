import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { copyToClipboard } from './clipboard';

describe('copyToClipboard', () => {
  describe('with modern clipboard API', () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn(),
        },
      });
      Object.assign(window, {
        isSecureContext: true,
      });
    });

    it('copies text using clipboard API', async () => {
      const writeTextMock = vi.mocked(navigator.clipboard.writeText);
      writeTextMock.mockResolvedValue();

      const result = await copyToClipboard('test text');

      expect(result).toBe(true);
      expect(writeTextMock).toHaveBeenCalledWith('test text');
      expect(writeTextMock).toHaveBeenCalledTimes(1);
    });

    it('returns false when clipboard API fails', async () => {
      const writeTextMock = vi.mocked(navigator.clipboard.writeText);
      writeTextMock.mockRejectedValue(new Error('Permission denied'));

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await copyToClipboard('test text');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to copy:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('with fallback method', () => {
    let mockTextarea: HTMLTextAreaElement;

    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: undefined,
      });
      Object.assign(window, {
        isSecureContext: false,
      });

      mockTextarea = {
        value: '',
        style: {},
        focus: vi.fn(),
        select: vi.fn(),
        remove: vi.fn(),
      } as unknown as HTMLTextAreaElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockTextarea);
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockTextarea
      );

      document.execCommand = vi.fn().mockReturnValue(true);
    });

    afterEach(() => {
      vi.restoreAllMocks();
      delete (document as any).execCommand;
    });

    it('copies text using fallback method', async () => {
      const result = await copyToClipboard('fallback text');

      expect(result).toBe(true);
      expect(mockTextarea.value).toBe('fallback text');
      expect(mockTextarea.style.position).toBe('fixed');
      expect(mockTextarea.style.left).toBe('-999999px');
      expect(mockTextarea.style.top).toBe('-999999px');
      expect(mockTextarea.focus).toHaveBeenCalled();
      expect(mockTextarea.select).toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(mockTextarea.remove).toHaveBeenCalled();
    });

    it('returns false when execCommand fails', async () => {
      vi.mocked(document.execCommand).mockReturnValue(false);

      const result = await copyToClipboard('fallback text');

      expect(result).toBe(false);
      expect(mockTextarea.remove).toHaveBeenCalled();
    });

    it('handles errors in fallback method', async () => {
      vi.mocked(document.execCommand).mockImplementation(() => {
        throw new Error('execCommand failed');
      });

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const result = await copyToClipboard('fallback text');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to copy:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('secure context detection', () => {
    it('uses fallback when not in secure context', async () => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });
      Object.assign(window, {
        isSecureContext: false,
      });

      const mockTextarea = {
        value: '',
        style: {},
        focus: vi.fn(),
        select: vi.fn(),
        remove: vi.fn(),
      } as unknown as HTMLTextAreaElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockTextarea);
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockTextarea
      );
      document.execCommand = vi.fn().mockReturnValue(true);

      await copyToClipboard('test');

      expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
      expect(document.execCommand).toHaveBeenCalledWith('copy');

      vi.restoreAllMocks();
      delete (document as any).execCommand;
    });

    it('uses fallback when clipboard API is undefined', async () => {
      Object.assign(navigator, {
        clipboard: undefined,
      });
      Object.assign(window, {
        isSecureContext: true,
      });

      const mockTextarea = {
        value: '',
        style: {},
        focus: vi.fn(),
        select: vi.fn(),
        remove: vi.fn(),
      } as unknown as HTMLTextAreaElement;

      vi.spyOn(document, 'createElement').mockReturnValue(mockTextarea);
      vi.spyOn(document.body, 'appendChild').mockImplementation(
        () => mockTextarea
      );
      document.execCommand = vi.fn().mockReturnValue(true);

      await copyToClipboard('test');

      expect(document.execCommand).toHaveBeenCalledWith('copy');

      vi.restoreAllMocks();
      delete (document as any).execCommand;
    });
  });
});
