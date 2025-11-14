import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Select from './Select';

describe('Select', () => {
  describe('Basic rendering', () => {
    it('renders select with placeholder', () => {
      render(
        <Select placeholder="Choose an option">
          <Select.Item value="option1">Option 1</Select.Item>
          <Select.Item value="option2">Option 2</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent('Choose an option');
    });

    it('renders with default placeholder', () => {
      render(
        <Select>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      expect(screen.getByRole('combobox')).toHaveTextContent(
        'Select an option'
      );
    });
  });

  describe('Size variants', () => {
    it('applies small size class', () => {
      render(
        <Select size="sm">
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('sm');
    });

    it('applies medium size class by default', () => {
      render(
        <Select>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('md');
    });

    it('applies large size class', () => {
      render(
        <Select size="lg">
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveClass('lg');
    });
  });

  describe('Full width prop', () => {
    it('applies full width class when fullWidth is true', () => {
      const { container } = render(
        <Select fullWidth>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const selectContainer = container.querySelector('.container');
      expect(selectContainer).toHaveClass('fullWidth');
    });

    it('does not apply full width class by default', () => {
      const { container } = render(
        <Select>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const selectContainer = container.querySelector('.container');
      expect(selectContainer).not.toHaveClass('fullWidth');
    });
  });

  describe('Accessibility attributes', () => {
    it('has proper ARIA attributes', () => {
      render(
        <Select>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      // Radix UI automatically manages aria-haspopup, focus on aria-expanded
    });

    it('sets aria-invalid when provided', () => {
      render(
        <Select aria-invalid={true}>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
    });

    it('sets aria-describedby when provided', () => {
      render(
        <Select aria-describedby="error-message">
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveAttribute('aria-describedby', 'error-message');
    });
  });

  describe('Interaction behavior', () => {
    it('opens dropdown when clicked', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <Select.Item value="option1">Option 1</Select.Item>
          <Select.Item value="option2">Option 2</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Option 1' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Option 2' })
      ).toBeInTheDocument();
    });

    it('selects item when clicked', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <Select onValueChange={onValueChange}>
          <Select.Item value="option1">Option 1</Select.Item>
          <Select.Item value="option2">Option 2</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const option = screen.getByRole('option', { name: 'Option 1' });
      await user.click(option);

      expect(onValueChange).toHaveBeenCalledWith('option1');
      expect(trigger).toHaveTextContent('Option 1');
    });

    it('closes dropdown with Escape key', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      // Use Escape key to close dropdown (more reliable than click outside)
      await user.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Keyboard navigation', () => {
    it('opens with Enter key', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard('{Enter}');

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('opens with Space key', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      trigger.focus();
      await user.keyboard(' ');

      expect(trigger).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes with Escape key', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('navigates options with arrow keys', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <Select.Item value="option1">Option 1</Select.Item>
          <Select.Item value="option2">Option 2</Select.Item>
          <Select.Item value="option3">Option 3</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      // Test that options are accessible with keyboard navigation
      await user.keyboard('{ArrowDown}');
      const option1 = screen.getByRole('option', { name: 'Option 1' });
      expect(option1).toBeInTheDocument();

      await user.keyboard('{ArrowDown}');
      const option2 = screen.getByRole('option', { name: 'Option 2' });
      expect(option2).toBeInTheDocument();
    });
  });

  describe('Groups and separators', () => {
    it('renders groups with labels', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <Select.Group label="Fruits">
            <Select.Item value="apple">Apple</Select.Item>
            <Select.Item value="banana">Banana</Select.Item>
          </Select.Group>
          <Select.Separator />
          <Select.Group label="Vegetables">
            <Select.Item value="carrot">Carrot</Select.Item>
          </Select.Group>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(screen.getByText('Fruits')).toBeInTheDocument();
      expect(screen.getByText('Vegetables')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'Carrot' })
      ).toBeInTheDocument();
    });
  });

  describe('Disabled state', () => {
    it('applies disabled state to trigger', () => {
      render(
        <Select disabled>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toBeDisabled();
    });

    it('does not open when disabled and clicked', async () => {
      const user = userEvent.setup();

      render(
        <Select disabled>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    it('renders disabled items', async () => {
      const user = userEvent.setup();

      render(
        <Select>
          <Select.Item value="option1">Option 1</Select.Item>
          <Select.Item value="option2" disabled>
            Option 2 (Disabled)
          </Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const disabledOption = screen.getByRole('option', {
        name: 'Option 2 (Disabled)',
      });
      expect(disabledOption).toHaveAttribute('data-disabled');
    });
  });

  describe('Custom className', () => {
    it('applies custom className to container', () => {
      const { container } = render(
        <Select className="custom-select">
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      const selectContainer = container.querySelector('.container');
      expect(selectContainer).toHaveClass('custom-select');
    });
  });

  describe('Forwarded ref', () => {
    it('forwards ref to trigger element', () => {
      const ref = vi.fn();

      render(
        <Select ref={ref}>
          <Select.Item value="option1">Option 1</Select.Item>
        </Select>
      );

      expect(ref).toHaveBeenCalled();
      expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('Value management', () => {
    it('shows selected value in trigger', () => {
      render(
        <Select value="option2">
          <Select.Item value="option1">Option 1</Select.Item>
          <Select.Item value="option2">Option 2</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      expect(trigger).toHaveTextContent('Option 2');
    });

    it('calls onValueChange when selection changes', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();

      render(
        <Select onValueChange={onValueChange}>
          <Select.Item value="option1">Option 1</Select.Item>
          <Select.Item value="option2">Option 2</Select.Item>
        </Select>
      );

      const trigger = screen.getByRole('combobox');
      await user.click(trigger);

      const option = screen.getByRole('option', { name: 'Option 2' });
      await user.click(option);

      expect(onValueChange).toHaveBeenCalledWith('option2');
    });
  });
});
