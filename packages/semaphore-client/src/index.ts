// Core client

export type { Logger } from './client';
export {
  clearBroadcastsCache,
  createAdminNotification,
  fetchAdminNotification,
  fetchAdminNotifications,
  fetchBroadcasts,
  getEmptyBroadcasts,
  SemaphoreError,
} from './client';
// React hooks
export type {
  UseAdminNotificationReturn,
  UseAdminNotificationsReturn,
} from './hooks';
export {
  useAdminNotification,
  useAdminNotifications,
  useBroadcasts,
  useCreateAdminNotification,
} from './hooks';
// Mock data for development
export {
  allCategoryBroadcasts,
  emptyBroadcasts,
  mockBroadcasts,
  mockOutageBroadcast,
} from './mock-broadcasts';
export type { FilterPaginateParams } from './mock-notifications';
export {
  filterAndPaginateNotifications,
  mockAdminNotification,
  mockAdminNotifications,
} from './mock-notifications';
// TanStack Query mutations
export type { CreateAdminNotificationVariables } from './mutation-options';
export { createAdminNotificationMutationOptions } from './mutation-options';
export type { BroadcastsQueryConfig } from './query-options';
// TanStack Query integration
export {
  adminNotificationQueryOptions,
  adminNotificationsInfiniteQueryOptions,
  broadcastsQueryOptions,
} from './query-options';
// Schemas and types
export type {
  Broadcast,
  BroadcastCategory,
  BroadcastsResponse,
  CreateUserNotification,
  FormattedText,
  UserNotification,
  UserNotificationWithUrl,
} from './schemas';
export {
  BroadcastCategorySchema,
  BroadcastSchema,
  BroadcastsResponseSchema,
  CreateUserNotificationSchema,
  FormattedTextSchema,
  UserNotificationSchema,
  UserNotificationWithUrlSchema,
} from './schemas';
export type {
  AdminNotificationFilters,
  AdminNotificationsPage,
} from './types';
