/**
 * Zod schemas for Times Square API responses.
 *
 * These schemas are the source of truth for types - all TypeScript types
 * are inferred from these schemas using z.infer<>.
 */
import { z } from 'zod';

// =============================================================================
// Enums
// =============================================================================

/** Node type in the GitHub contents tree */
export const GitHubNodeTypeSchema = z.enum([
  'owner',
  'repo',
  'directory',
  'page',
]);

/** GitHub check run status */
export const GitHubCheckRunStatusSchema = z.enum([
  'queued',
  'in_progress',
  'completed',
]);

/** GitHub check run conclusion */
export const GitHubCheckRunConclusionSchema = z.enum([
  'success',
  'failure',
  'neutral',
  'cancelled',
  'timed_out',
  'action_required',
  'stale',
]);

/** GitHub PR state */
export const GitHubPrStateSchema = z.enum([
  'draft',
  'open',
  'merged',
  'closed',
]);

/** HTML execution status from SSE events */
export const ExecutionStatusSchema = z.enum([
  'queued',
  'in_progress',
  'complete',
]);

// =============================================================================
// Component Schemas
// =============================================================================

/**
 * Formatted text that is available in both markdown and HTML.
 */
export const FormattedTextSchema = z.object({
  gfm: z.string(),
  html: z.string(),
});

/**
 * Person (author) information.
 */
export const PersonSchema = z.object({
  name: z.string(),
  username: z.string().nullable().optional(),
  affiliation_name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  slack_name: z.string().nullable().optional(),
});

/**
 * GitHub source metadata for GitHub-backed pages.
 */
export const GitHubSourceMetadataSchema = z.object({
  owner: z.string(),
  repository: z.string(),
  source_path: z.string(),
  sidecar_path: z.string(),
});

/**
 * GitHub contributor information.
 */
export const GitHubContributorSchema = z.object({
  username: z.string(),
  html_url: z.string(),
  avatar_url: z.string(),
});

// =============================================================================
// GitHub Contents Tree
// =============================================================================

/**
 * Type interface for recursive ContentNode (needed for z.lazy).
 */
export type ContentNode = {
  node_type: z.infer<typeof GitHubNodeTypeSchema>;
  path: string;
  title: string;
  contents: ContentNode[];
};

/**
 * GitHub contents node (recursive tree structure).
 */
export const GitHubContentsNodeSchema: z.ZodType<ContentNode> = z.lazy(() =>
  z.object({
    node_type: GitHubNodeTypeSchema,
    path: z.string(),
    title: z.string(),
    contents: z.array(GitHubContentsNodeSchema),
  })
);

/**
 * Root of the GitHub contents tree.
 */
export const GitHubContentsRootSchema = z.object({
  contents: z.array(GitHubContentsNodeSchema),
});

// =============================================================================
// GitHub Check Run
// =============================================================================

/**
 * GitHub check run summary.
 */
export const GitHubCheckRunSummarySchema = z.object({
  status: GitHubCheckRunStatusSchema,
  conclusion: GitHubCheckRunConclusionSchema.nullable(),
  external_id: z.string().nullable().optional(),
  head_sha: z.string(),
  name: z.string(),
  html_url: z.string(),
  report_title: z.string().nullable().optional(),
  report_summary: FormattedTextSchema.nullable().optional(),
  report_text: FormattedTextSchema.nullable().optional(),
});

// =============================================================================
// Pull Request
// =============================================================================

/**
 * GitHub pull request information.
 */
export const GitHubPrSchema = z.object({
  number: z.number().int(),
  title: z.string(),
  conversation_url: z.string(),
  contributor: GitHubContributorSchema,
  state: GitHubPrStateSchema,
});

/**
 * GitHub PR contents response.
 * From GET /v1/github-pr/{owner}/{repo}/{commit}
 */
export const GitHubPrContentsSchema = z.object({
  contents: z.array(GitHubContentsNodeSchema),
  owner: z.string(),
  repo: z.string(),
  commit: z.string(),
  yaml_check: GitHubCheckRunSummarySchema.nullable(),
  nbexec_check: GitHubCheckRunSummarySchema.nullable(),
  pull_requests: z.array(GitHubPrSchema),
});

// =============================================================================
// Page Schemas
// =============================================================================

/**
 * Page summary (from list endpoint).
 * From GET /v1/pages
 */
export const PageSummarySchema = z.object({
  name: z.string(),
  title: z.string(),
  self_url: z.string(),
});

/**
 * Full page metadata.
 * From GET /v1/pages/{page} and GET /v1/github/{display_path}
 */
export const PageSchema = z.object({
  name: z.string(),
  title: z.string(),
  description: FormattedTextSchema.nullable(),
  cache_ttl: z.number().int().nullable().optional(),
  date_added: z.string(),
  authors: z.array(PersonSchema).default([]),
  tags: z.array(z.string()).default([]),
  uploader_username: z.string().nullable(),
  self_url: z.string(),
  source_url: z.string(),
  rendered_url: z.string(),
  html_url: z.string(),
  html_status_url: z.string(),
  html_events_url: z.string(),
  // Parameters are JSON Schema definitions - keep flexible
  parameters: z.record(z.record(z.unknown())),
  github: GitHubSourceMetadataSchema.nullable(),
});

// =============================================================================
// HTML Status and Events
// =============================================================================

/**
 * HTML status response.
 * From GET /v1/pages/{page}/htmlstatus
 */
export const HtmlStatusSchema = z.object({
  available: z.boolean(),
  html_url: z.string(),
  html_hash: z.string().nullable(),
});

/**
 * HTML event from SSE stream.
 * From GET /v1/pages/{page}/html/events
 */
export const HtmlEventSchema = z.object({
  date_submitted: z.string(),
  date_started: z.string().nullable(),
  date_finished: z.string().nullable(),
  execution_status: ExecutionStatusSchema,
  execution_duration: z.number().nullable(),
  html_hash: z.string().nullable(),
  html_url: z.string(),
});

// =============================================================================
// Error Schemas
// =============================================================================

/**
 * Error detail from validation errors.
 */
export const ErrorDetailSchema = z.object({
  loc: z
    .array(z.union([z.string(), z.number()]))
    .nullable()
    .optional(),
  msg: z.string(),
  type: z.string(),
});

/**
 * Error model returned by Times Square API.
 */
export const ErrorModelSchema = z.object({
  detail: z.array(ErrorDetailSchema),
});

/**
 * HTTP validation error (422 responses).
 */
export const ValidationErrorSchema = z.object({
  loc: z.array(z.union([z.string(), z.number()])),
  msg: z.string(),
  type: z.string(),
});

export const HTTPValidationErrorSchema = z.object({
  detail: z.array(ValidationErrorSchema),
});

// =============================================================================
// Index/Metadata Schemas
// =============================================================================

/**
 * Application metadata.
 */
export const MetadataSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string().nullable().optional(),
  repository_url: z.string().nullable().optional(),
  documentation_url: z.string().nullable().optional(),
});

// =============================================================================
// Type Exports (inferred from schemas)
// =============================================================================

export type GitHubNodeType = z.infer<typeof GitHubNodeTypeSchema>;
export type GitHubCheckRunStatus = z.infer<typeof GitHubCheckRunStatusSchema>;
export type GitHubCheckRunConclusion = z.infer<
  typeof GitHubCheckRunConclusionSchema
>;
export type GitHubPrState = z.infer<typeof GitHubPrStateSchema>;
export type ExecutionStatus = z.infer<typeof ExecutionStatusSchema>;
export type FormattedText = z.infer<typeof FormattedTextSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type GitHubSourceMetadata = z.infer<typeof GitHubSourceMetadataSchema>;
export type GitHubContributor = z.infer<typeof GitHubContributorSchema>;
export type GitHubContentsRoot = z.infer<typeof GitHubContentsRootSchema>;
export type GitHubCheckRunSummary = z.infer<typeof GitHubCheckRunSummarySchema>;
export type GitHubPr = z.infer<typeof GitHubPrSchema>;
export type GitHubPrContents = z.infer<typeof GitHubPrContentsSchema>;
export type PageSummary = z.infer<typeof PageSummarySchema>;
export type Page = z.infer<typeof PageSchema>;
export type HtmlStatus = z.infer<typeof HtmlStatusSchema>;
export type HtmlEvent = z.infer<typeof HtmlEventSchema>;
export type ErrorDetail = z.infer<typeof ErrorDetailSchema>;
export type ErrorModel = z.infer<typeof ErrorModelSchema>;
export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type HTTPValidationError = z.infer<typeof HTTPValidationErrorSchema>;
export type Metadata = z.infer<typeof MetadataSchema>;
