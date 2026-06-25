import { mockUserNotification } from '@lsst-sqre/semaphore-client';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, within } from 'storybook/test';

import UserNotificationDetailView from './UserNotificationDetailView';

const meta: Meta<typeof UserNotificationDetailView> = {
  title: 'Components/UserNotifications/UserNotificationDetailView',
  component: UserNotificationDetailView,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof UserNotificationDetailView>;

// An unread notification with a Markdown body — the common case.
export const Loaded: Story = {
  args: {
    notification: mockUserNotification,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Metadata: the id is shown.
    await expect(canvas.getByText(mockUserNotification.id)).toBeInTheDocument();
    // Unread items show the "Unread" badge.
    await expect(canvas.getByText('Unread')).toBeInTheDocument();
    // The summary's `gfm` renders Markdown (the emphasised word is its own
    // element).
    await expect(canvas.getByText('quota')).toBeInTheDocument();
    // The summary is the page-level (h1) heading.
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(
      mockUserNotification.summary.gfm.replace(/\*\*/g, '')
    );
  },
};

// A read notification shows the read timestamp instead of the unread marker.
export const Read: Story = {
  args: {
    notification: {
      ...mockUserNotification,
      read: '2026-06-12T18:30:00+00:00',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The read timestamp is shown and the "Unread" badge is gone. ("Read" alone
    // is ambiguous — it is also the metadata label — so assert the timestamp.)
    await expect(canvas.getByText('2026-06-12 18:30 UTC')).toBeInTheDocument();
    await expect(canvas.queryByText('Unread')).not.toBeInTheDocument();
  },
};

// A notification without a body shows the no-body placeholder.
export const NoBody: Story = {
  args: {
    notification: {
      ...mockUserNotification,
      body: null,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('This notification has no body.')
    ).toBeInTheDocument();
  },
};

// While the notification loads.
export const Loading: Story = {
  args: {
    isLoading: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Loading notification…')).toBeInTheDocument();
  },
};

// A stale link to an unknown id renders a graceful not-found state.
export const NotFound: Story = {
  args: {
    error: Object.assign(new Error('Semaphore API error: 404 Not Found'), {
      statusCode: 404,
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Notification not found')
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('link', { name: /Back to notifications/ })
    ).toHaveAttribute('href', '/notifications');
  },
};

// A non-404 failure surfaces the error message with a way back.
export const ErrorState: Story = {
  args: {
    error: new Error('Network request failed'),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Error loading notification')
    ).toBeInTheDocument();
    await expect(
      canvas.getByText('Network request failed')
    ).toBeInTheDocument();
  },
};
