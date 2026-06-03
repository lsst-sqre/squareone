import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import SentryTestButtons from './SentryTestButtons';

const meta: Meta<typeof SentryTestButtons> = {
  title: 'Components/SentryTestButtons',
  component: SentryTestButtons,
};

export default meta;
type Story = StoryObj<typeof SentryTestButtons>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Both test buttons render.
    const throwButton = canvas.getByRole('button', {
      name: /throw uncaught error/i,
    });
    const handledButton = canvas.getByRole('button', {
      name: /capture handled exception/i,
    });
    await expect(throwButton).toBeInTheDocument();
    await expect(handledButton).toBeInTheDocument();

    // Capturing a handled exception does not break the page: the button is
    // still present afterwards. (The "Throw uncaught error" button is left
    // unclicked here because it intentionally throws during render.)
    await userEvent.click(handledButton);
    await expect(handledButton).toBeInTheDocument();
  },
};
