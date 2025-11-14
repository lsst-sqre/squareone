import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import Button from '../Button/Button';
import Modal from './Modal';

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls whether the modal is open',
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'Size of the modal',
    },
    closeButton: {
      control: 'boolean',
      description: 'Shows/hides the close button',
    },
    title: {
      control: 'text',
      description: 'Modal title',
    },
    description: {
      control: 'text',
      description: 'Modal description',
    },
    visuallyHideTitle: {
      control: 'boolean',
      description:
        'Whether to visually hide the title while keeping it accessible',
    },
    visuallyHideDescription: {
      control: 'boolean',
      description:
        'Whether to visually hide the description while keeping it accessible',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

function ModalWithTrigger(args: any) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Open Modal</Button>
      <Modal {...args} open={open} onOpenChange={setOpen} />
    </>
  );
}

export const Basic: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Modal Title',
    description: 'This is a basic modal with a title and description.',
    children: (
      <div>
        <p style={{ marginBottom: '1rem' }}>
          This is the modal content. You can put any content here.
        </p>
        <div
          style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}
        >
          <Button appearance="outline" tone="secondary">
            Cancel
          </Button>
          <Button>Confirm</Button>
        </div>
      </div>
    ),
  },
};

export const Small: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Small Modal',
    description: 'A compact modal for simple interactions.',
    size: 'small',
    children: (
      <div>
        <p style={{ marginBottom: '1rem' }}>This is a small modal.</p>
        <Button block>Got it</Button>
      </div>
    ),
  },
};

export const Medium: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Medium Modal',
    description: 'A medium-sized modal for forms and detailed content.',
    size: 'medium',
    children: (
      <div>
        <p style={{ marginBottom: '1rem' }}>
          This is a medium-sized modal with some additional content.
        </p>
        <p style={{ marginBottom: '1rem' }}>
          Medium modals work well for forms and detailed information.
        </p>
        <div
          style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}
        >
          <Button appearance="outline" tone="secondary">
            Cancel
          </Button>
          <Button>Save</Button>
        </div>
      </div>
    ),
  },
};

export const Large: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Large Modal',
    description: 'A spacious modal for complex content and multiple sections.',
    size: 'large',
    children: (
      <div>
        <p style={{ marginBottom: '1rem' }}>
          This is a large modal suitable for complex content.
        </p>
        <div
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Section 1</h3>
          <p>Large modals can contain multiple sections of content.</p>
        </div>
        <div
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Section 2</h3>
          <p>They provide more space for detailed information.</p>
        </div>
        <div
          style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}
        >
          <Button appearance="outline" tone="secondary">
            Cancel
          </Button>
          <Button>Continue</Button>
        </div>
      </div>
    ),
  },
};

export const WithoutCloseButton: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'No Close Button',
    description: 'This modal does not have a close button.',
    closeButton: false,
    children: (
      <div>
        <p style={{ marginBottom: '1rem' }}>
          You must use the action buttons to close this modal.
        </p>
        <Button block>Close</Button>
      </div>
    ),
  },
};

export const WithVisuallyHiddenTitleAndDescription: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Custom Content Modal',
    description:
      'A modal with custom content and visually hidden title and description for accessibility.',
    visuallyHideTitle: true,
    visuallyHideDescription: true,
    children: (
      <div>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>Custom Content</h2>
        <p style={{ marginBottom: '1rem' }}>
          This modal uses visually hidden title and description for
          accessibility, while displaying custom content.
        </p>
        <Button block>Okay</Button>
      </div>
    ),
  },
};

export const LongContent: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Long Content Modal',
    description: 'This modal demonstrates scrollable content.',
    children: (
      <div>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} style={{ marginBottom: '1rem' }}>
            Paragraph {i + 1}: Lorem ipsum dolor sit amet, consectetur
            adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
            dolore magna aliqua.
          </p>
        ))}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            justifyContent: 'flex-end',
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'white',
            paddingTop: '1rem',
          }}
        >
          <Button appearance="outline" tone="secondary">
            Cancel
          </Button>
          <Button>Confirm</Button>
        </div>
      </div>
    ),
  },
};

export const ConfirmationDialog: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Delete Item',
    description:
      'Are you sure you want to delete this item? This action cannot be undone.',
    size: 'small',
    children: (
      <div
        style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}
      >
        <Button appearance="outline" tone="secondary">
          Cancel
        </Button>
        <Button>Delete</Button>
      </div>
    ),
  },
};

export const FormModal: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Create New Item',
    description: 'Fill out the form below to create a new item.',
    children: (
      <form onSubmit={(e) => e.preventDefault()}>
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="name"
            style={{ display: 'block', marginBottom: '0.5rem' }}
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #dce0e3',
              borderRadius: '4px',
            }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label
            htmlFor="description"
            style={{ display: 'block', marginBottom: '0.5rem' }}
          >
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #dce0e3',
              borderRadius: '4px',
            }}
          />
        </div>
        <div
          style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}
        >
          <Button appearance="outline" tone="secondary">
            Cancel
          </Button>
          <Button type="submit">Create</Button>
        </div>
      </form>
    ),
  },
};

export const OpenByDefault: Story = {
  args: {
    open: true,
    onOpenChange: () => {},
    title: 'Open Modal',
    description: 'This modal is open by default for demonstration purposes.',
    children: (
      <div>
        <p style={{ marginBottom: '1rem' }}>
          In Storybook, you can control the open state using the controls panel.
        </p>
        <Button block>Close</Button>
      </div>
    ),
  },
};

export const KeyboardTest: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Keyboard Navigation Test',
    description: 'Press Escape to close this modal.',
    children: (
      <div>
        <p style={{ marginBottom: '1rem' }}>
          This modal tests keyboard navigation and accessibility features.
        </p>
        <Button block>Close</Button>
      </div>
    ),
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step('Open modal', async () => {
      const openButton = canvas.getByRole('button', { name: /open modal/i });
      await userEvent.click(openButton);
    });

    await step('Verify modal is open', async () => {
      const modal = await body.findByRole('dialog', {}, { timeout: 3000 });
      await expect(modal).toBeInTheDocument();
    });

    await step('Close with Escape key', async () => {
      await userEvent.keyboard('{Escape}');
    });
  },
};

export const CloseButtonTest: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Close Button Test',
    children: <p>Click the close button (X) to close this modal.</p>,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step('Open modal', async () => {
      const openButton = canvas.getByRole('button', { name: /open modal/i });
      await userEvent.click(openButton);
    });

    await step('Verify modal is open', async () => {
      const modal = await body.findByRole('dialog', {}, { timeout: 3000 });
      await expect(modal).toBeInTheDocument();
    });

    await step('Click close button', async () => {
      const closeButton = body.getByRole('button', { name: /close/i });
      await userEvent.click(closeButton);
    });
  },
};

export const AccessibilityTest: Story = {
  render: (args) => <ModalWithTrigger {...args} />,
  args: {
    title: 'Accessibility Test',
    description: 'This modal tests accessibility attributes.',
    children: <Button block>Confirm</Button>,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);

    await step('Open modal', async () => {
      const openButton = canvas.getByRole('button', { name: /open modal/i });
      await userEvent.click(openButton);
    });

    await step('Verify modal structure', async () => {
      const modal = await body.findByRole('dialog', {}, { timeout: 3000 });
      await expect(modal).toBeInTheDocument();

      const title = body.getByText('Accessibility Test');
      await expect(title).toBeInTheDocument();

      const description = body.getByText(
        'This modal tests accessibility attributes.'
      );
      await expect(description).toBeInTheDocument();
    });
  },
};
