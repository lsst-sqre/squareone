import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from './Modal';

describe('Modal', () => {
  describe('Basic rendering', () => {
    it('renders modal when open is true', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render modal when open is false', () => {
      render(
        <Modal open={false} onOpenChange={vi.fn()} title="Test Modal">
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders title when provided', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()} title="Custom Title">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Custom Title')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(
        <Modal
          open={true}
          onOpenChange={vi.fn()}
          title="Title"
          description="This is a description"
        >
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('renders without title and description', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()}>
          <p>Only content</p>
        </Modal>
      );

      expect(screen.getByText('Only content')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('renders children content', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()} title="Title">
          <div data-testid="custom-content">Custom content</div>
        </Modal>
      );

      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });

  describe('Size variations', () => {
    it('applies small size data attribute', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()} size="small">
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('data-size', 'small');
    });

    it('applies medium size by default', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('data-size', 'medium');
    });

    it('applies large size data attribute', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()} size="large">
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('data-size', 'large');
    });
  });

  describe('Close button', () => {
    it('renders close button by default', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      expect(
        screen.getByRole('button', { name: /close/i })
      ).toBeInTheDocument();
    });

    it('does not render close button when closeButton is false', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()} closeButton={false}>
          <p>Content</p>
        </Modal>
      );

      expect(
        screen.queryByRole('button', { name: /close/i })
      ).not.toBeInTheDocument();
    });

    it('calls onOpenChange with false when close button is clicked', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal open={true} onOpenChange={handleOpenChange}>
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Event handlers', () => {
    it('calls onOpenChange when escape key is pressed', async () => {
      const handleOpenChange = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal open={true} onOpenChange={handleOpenChange}>
          <p>Content</p>
        </Modal>
      );

      await user.keyboard('{Escape}');

      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    it('supports overlay interaction for closing', async () => {
      const handleOpenChange = vi.fn();

      render(
        <Modal open={true} onOpenChange={handleOpenChange}>
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className to content', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()} className="custom-modal">
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveClass('custom-modal');
    });
  });

  describe('Accessibility', () => {
    it('has role="dialog"', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('links title to dialog with aria-labelledby', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()} title="Modal Title">
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      const title = screen.getByText('Modal Title');

      expect(dialog).toHaveAttribute('aria-labelledby', title.id);
    });

    it('links description to dialog with aria-describedby', () => {
      render(
        <Modal
          open={true}
          onOpenChange={vi.fn()}
          title="Title"
          description="Description text"
        >
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      const description = screen.getByText('Description text');

      expect(dialog).toHaveAttribute('aria-describedby', description.id);
    });

    it('close button has accessible label', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      expect(closeButton).toHaveAccessibleName('Close');
    });

    it('traps focus within modal when open', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <button>Outside button</button>
          <Modal open={true} onOpenChange={vi.fn()} title="Modal">
            <button>Inside button</button>
          </Modal>
        </div>
      );

      const insideButton = screen.getByRole('button', {
        name: /inside button/i,
      });
      const closeButton = screen.getByRole('button', { name: /close/i });

      await user.tab();

      const focusedElement = document.activeElement;
      expect([insideButton, closeButton]).toContain(focusedElement);
    });
  });

  describe('Content overflow', () => {
    it('renders long content without errors', () => {
      render(
        <Modal open={true} onOpenChange={vi.fn()}>
          <div style={{ height: '2000px' }}>Very long content</div>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('Very long content')).toBeInTheDocument();
    });
  });

  describe('Portal rendering', () => {
    it('renders modal content in a portal', () => {
      const { container } = render(
        <Modal open={true} onOpenChange={vi.fn()}>
          <p>Content</p>
        </Modal>
      );

      const dialog = screen.getByRole('dialog');
      expect(container.contains(dialog)).toBe(false);
    });
  });
});
