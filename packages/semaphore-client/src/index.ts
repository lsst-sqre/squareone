// Core client

export type { Logger } from './client';
export {
  clearBroadcastsCache,
  createAdminNotification,
  fetchAdminNotification,
  fetchAdminNotifications,
  fetchBroadcasts,
  fetchUserNotification,
  fetchUserNotifications,
  getEmptyBroadcasts,
  markNotificationsRead,
  markNotificationsUnread,
  SemaphoreError,
} from './client';
// React hooks
export type {
  UseAdminNotificationReturn,
  UseAdminNotificationsReturn,
  UseUnreadNotificationCountOptions,
  UseUnreadNotificationCountReturn,
  UseUserNotificationReturn,
  UseUserNotificationsReturn,
} from './hooks';
export {
  useAdminNotification,
  useAdminNotifications,
  useBroadcasts,
  useCreateAdminNotification,
  useMarkNotificationsRead,
  useMarkNotificationsUnread,
  useUnreadNotificationCount,
  useUserNotification,
  useUserNotifications,
} from './hooks';
// Mock data for development
export {
  allCategoryBroadcasts,
  emptyBroadcasts,
  mockBroadcasts,
  mockOutageBroadcast,
} from './mock-broadcasts';
export type {
  FilterPaginateParams,
  UserFilterPaginateParams,
} from './mock-notifications';
export {
  filterAndPaginateNotifications,
  filterAndPaginateUserNotifications,
  markUserNotificationsRead,
  mockAdminNotification,
  mockAdminNotifications,
  mockUserNotification,
  mockUserNotifications,
} from './mock-notifications';
// TanStack Query mutations
export type {
  CreateAdminNotificationVariables,
  MarkNotificationsReadVariables,
  MarkNotificationsUnreadVariables,
} from './mutation-options';
export {
  createAdminNotificationMutationOptions,
  markNotificationsReadMutationOptions,
  markNotificationsUnreadMutationOptions,
} from './mutation-options';
export type {
  BroadcastsQueryConfig,
  UnreadNotificationCountQueryConfig,
} from './query-options';
// TanStack Query integration
export {
  adminNotificationQueryOptions,
  adminNotificationsInfiniteQueryOptions,
  broadcastsQueryOptions,
  unreadNotificationCountQueryOptions,
  userNotificationQueryOptions,
  userNotificationsInfiniteQueryOptions,
} from './query-options';
// Schemas and types
export type {
  Broadcast,
  BroadcastCategory,
  BroadcastsResponse,
  CreateUserNotification,
  FormattedText,
  UserNotification,
  UserNotificationFormatted,
  UserNotificationSummary,
  UserNotificationWithUrl,
} from './schemas';
export {
  BroadcastCategorySchema,
  BroadcastSchema,
  BroadcastsResponseSchema,
  CreateUserNotificationSchema,
  FormattedTextSchema,
  UserNotificationFormattedSchema,
  UserNotificationSchema,
  UserNotificationSummarySchema,
  UserNotificationWithUrlSchema,
} from './schemas';
export type {
  AdminNotificationFilters,
  AdminNotificationsPage,
  UserNotificationFilters,
  UserNotificationListParams,
  UserNotificationsPage,
} from './types';
