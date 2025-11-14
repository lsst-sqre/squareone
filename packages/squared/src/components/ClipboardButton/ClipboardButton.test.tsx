import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ClipboardButton from './ClipboardButton';

describe('ClipboardButton', () => {
  let mockClipboard: { writeText: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
    };
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });
    Object.assign(window, {
      isSecureContext: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic rendering', () => {
    it('renders button with default label', () => {
      render(<ClipboardButton text="test" />);
      expect(
        screen.getByRole('button', { name: /copy to clipboard/i })
      ).toBeInTheDocument();
    });

    it('renders button with custom label', () => {
      render(<ClipboardButton text="test" label="Copy Code" />);
      expect(
        screen.getByRole('button', { name: /copy code to clipboard/i })
      ).toBeInTheDocument();
    });

    it('renders with clipboard icon by default', () => {
      const { container } = render(<ClipboardButton text="test" />);
      expect(container.querySelector('.leadingIcon')).toBeInTheDocument();
    });

    it('renders without icon when showIcon is false', () => {
      const { container } = render(
        <ClipboardButton text="test" showIcon={false} />
      );
      expect(container.querySelector('.leadingIcon')).not.toBeInTheDocument();
    });
  });

  describe('Copy functionality', () => {
    it('copies text to clipboard on click', async () => {
      render(<ClipboardButton text="test text" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockClipboard.writeText).toHaveBeenCalledWith('test text');
      });
    });

    it('handles function-based text', async () => {
      const textFn = vi.fn(() => 'dynamic text');
      render(<ClipboardButton text={textFn} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(textFn).toHaveBeenCalled();
        expect(mockClipboard.writeText).toHaveBeenCalledWith('dynamic text');
      });
    });

    it('shows success state after successful copy', async () => {
      render(<ClipboardButton text="test" successLabel="Done!" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Done!')).toBeInTheDocument();
      });
    });

    it('shows success message with default label', async () => {
      render(<ClipboardButton text="test" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });

    it('calls onCopy callback with copied text', async () => {
      const onCopy = vi.fn();
      render(<ClipboardButton text="test text" onCopy={onCopy} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalledWith('test text');
      });
    });

    it('handles copy failure gracefully', async () => {
      mockClipboard.writeText.mockRejectedValue(new Error('Copy failed'));
      const onError = vi.fn();
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      render(<ClipboardButton text="test" onError={onError} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(onError).toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalled();
      });

      consoleError.mockRestore();
    });
  });

  describe('Success state timing', () => {
    it('shows success state immediately after copy', async () => {
      render(<ClipboardButton text="test" successDuration={2000} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });
    });
  });

  describe('Button props inheritance', () => {
    it('applies size prop correctly', () => {
      const { container } = render(<ClipboardButton text="test" size="lg" />);
      expect(container.querySelector('.lg')).toBeInTheDocument();
    });

    it('applies appearance and tone props', () => {
      const { container } = render(
        <ClipboardButton text="test" appearance="outline" tone="secondary" />
      );
      const button = container.querySelector('button');
      expect(button).toHaveClass('outline', 'secondary');
    });

    it('respects disabled prop', () => {
      render(<ClipboardButton text="test" disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not copy when disabled', () => {
      render(<ClipboardButton text="test" disabled />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockClipboard.writeText).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper aria-label by default', () => {
      render(<ClipboardButton text="test" />);
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Copy Copy to clipboard'
      );
    });

    it('uses custom aria-label when provided', () => {
      render(<ClipboardButton text="test" ariaLabel="Copy token" />);
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Copy token'
      );
    });

    it('has clipboard icon in button', () => {
      const { container } = render(<ClipboardButton text="test" />);
      const icon = container.querySelector('.leadingIcon svg');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Success state styling', () => {
    it('shows success state after copy', async () => {
      const { container } = render(<ClipboardButton text="test" size="sm" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        const successState = container.querySelector('.successState');
        expect(successState).toBeInTheDocument();
      });
    });
  });

  describe('Cleanup', () => {
    it('clears timeout on unmount', async () => {
      const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

      const { unmount } = render(<ClipboardButton text="test" />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Copied!')).toBeInTheDocument();
      });

      unmount();

      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });
});
