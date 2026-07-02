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

// An unread notification with a Markdown body and neighbors on both sides — the
// common case in the middle of the inbox.
export const Loaded: Story = {
  args: {
    notification: mockUserNotification,
    prevNotification: {
      id: 'ntf-000',
      summary: 'Your notebook server was culled after 24h idle',
    },
    nextNotification: {
      id: 'ntf-002',
      summary: 'Scheduled maintenance window this weekend',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Unread items show the "Unread" badge.
    await expect(canvas.getByText('Unread')).toBeInTheDocument();
    // The summary's `gfm` renders Markdown (the emphasised word is its own
    // element).
    await expect(canvas.getByText('quota')).toBeInTheDocument();
    // The summary is the page-level (h1) heading.
    await expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent(
      mockUserNotification.summary.gfm.replace(/\*\*/g, '')
    );
    // Prev/next links point at the neighbor detail pages.
    await expect(
      canvas.getByRole('link', { name: /Previous/ })
    ).toHaveAttribute('href', '/notifications/ntf-000');
    await expect(canvas.getByRole('link', { name: /Next/ })).toHaveAttribute(
      'href',
      '/notifications/ntf-002'
    );
  },
};

// A read notification shows the "Read" badge instead of the unread marker.
export const Read: Story = {
  args: {
    notification: {
      ...mockUserNotification,
      read: '2026-06-12T18:30:00+00:00',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Read')).toBeInTheDocument();
    await expect(canvas.queryByText('Unread')).not.toBeInTheDocument();
  },
};

// At the ends of the list a neighbor is missing, so only one nav link appears.
export const ListEnd: Story = {
  args: {
    notification: mockUserNotification,
    prevNotification: {
      id: 'ntf-000',
      summary: 'Your notebook server was culled after 24h idle',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('link', { name: /Previous/ })
    ).toBeInTheDocument();
    await expect(
      canvas.queryByRole('link', { name: /Next/ })
    ).not.toBeInTheDocument();
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
