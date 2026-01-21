/**
 * Times Square API client for the Rubin Science Platform.
 *
 * This package provides a type-safe client for the Times Square notebook
 * execution API with TanStack Query integration.
 *
 * @packageDocumentation
 */

// =============================================================================
// Schemas & Types
// =============================================================================

export {
  // Types (inferred from schemas)
  type ContentNode,
  type ErrorDetail,
  // Error schemas
  ErrorDetailSchema,
  type ErrorModel,
  ErrorModelSchema,
  type ExecutionStatus,
  // Enum schemas
  ExecutionStatusSchema,
  type FormattedText,
  // Component schemas
  FormattedTextSchema,
  type GitHubCheckRunConclusion,
  GitHubCheckRunConclusionSchema,
  type GitHubCheckRunStatus,
  GitHubCheckRunStatusSchema,
  type GitHubCheckRunSummary,
  // Check/PR schemas
  GitHubCheckRunSummarySchema,
  GitHubContentsNodeSchema,
  type GitHubContentsRoot,
  GitHubContentsRootSchema,
  type GitHubContributor,
  GitHubContributorSchema,
  type GitHubNodeType,
  GitHubNodeTypeSchema,
  type GitHubPr,
  type GitHubPrContents,
  GitHubPrContentsSchema,
  GitHubPrSchema,
  type GitHubPrState,
  GitHubPrStateSchema,
  type GitHubSourceMetadata,
  GitHubSourceMetadataSchema,
  type HTTPValidationError,
  HTTPValidationErrorSchema,
  type HtmlEvent,
  // HTML schemas
  HtmlEventSchema,
  type HtmlStatus,
  HtmlStatusSchema,
  type Metadata,
  MetadataSchema,
  type Page,
  // Page schemas
  PageSchema,
  type PageSummary,
  PageSummarySchema,
  type Person,
  PersonSchema,
  type ValidationError,
  ValidationErrorSchema,
} from './schemas';

// =============================================================================
// Client Functions
// =============================================================================

export {
  buildUrlWithParams,
  DEFAULT_TIMES_SQUARE_URL,
  fetchGitHubContents,
  fetchGitHubHtmlStatus,
  fetchGitHubPage,
  fetchGitHubPrContents,
  fetchGitHubPrPage,
  fetchHtmlStatus,
  fetchPage,
  fetchPages,
  getEmptyGitHubContents,
  getEmptyGitHubPrContents,
} from './client';

// =============================================================================
// Errors
// =============================================================================

export {
  formatValidationError,
  getErrorMessageForStatus,
  TimesSquareError,
} from './errors';

// =============================================================================
// Query Keys
// =============================================================================

export { type TimesSquareQueryKeys, timesSquareKeys } from './query-keys';

// =============================================================================
// Query Options
// =============================================================================

export {
  githubContentsQueryOptions,
  githubPageQueryOptions,
  githubPrContentsQueryOptions,
  githubPrPageQueryOptions,
  htmlStatusQueryOptions,
  pageQueryOptions,
  pagesQueryOptions,
} from './query-options';

// =============================================================================
// SSE
// =============================================================================

export {
  createHtmlEventsUrl,
  type HtmlEventCallback,
  type SseErrorCallback,
  type SubscribeOptions,
  subscribeToHtmlEvents,
} from './sse';

// =============================================================================
// Mock Data
// =============================================================================

export {
  createMockContentNode,
  mockEmptyGitHubPrContents,
  mockGitHubCheckFailure,
  mockGitHubCheckInProgress,
  mockGitHubCheckSuccess,
  mockGitHubContents,
  mockGitHubPr,
  mockGitHubPrContents,
  mockHtmlEventComplete,
  mockHtmlEventInProgress,
  mockHtmlEventQueued,
  mockHtmlStatusAvailable,
  mockHtmlStatusPending,
  mockPage,
  mockPageSummaries,
  mockPageSummary,
} from './mock-data';

// =============================================================================
// Test Utilities
// =============================================================================

export {
  generateRandomGitHubCheck,
  generateRandomGitHubPr,
  generateRandomHtmlEvent,
  generateRandomHtmlStatus,
  generateRandomPage,
  generateRandomPageSummary,
  generateRandomPerson,
  generators,
} from './test-utils';

// =============================================================================
// Hooks
// =============================================================================

export {
  type UseGitHubContentsOptions,
  type UseGitHubContentsReturn,
  type UseGitHubPrContentsOptions,
  type UseGitHubPrContentsReturn,
  type UseHtmlStatusOptions,
  type UseHtmlStatusReturn,
  type UseTimesSquarePageOptions,
  type UseTimesSquarePageReturn,
  useGitHubContents,
  useGitHubPrContents,
  useHtmlStatus,
  useTimesSquarePage,
  useTimesSquareUrl,
} from './hooks';
