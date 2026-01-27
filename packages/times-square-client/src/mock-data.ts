/**
 * Mock data for Times Square API responses.
 *
 * Hand-written, realistic mock data for development and testing.
 */
import type {
  ContentNode,
  GitHubCheckRunSummary,
  GitHubContentsRoot,
  GitHubPr,
  GitHubPrContents,
  HtmlEvent,
  HtmlStatus,
  Page,
  PageSummary,
} from './schemas';

// =============================================================================
// Page Mock Data
// =============================================================================

/**
 * Mock page metadata for a typical notebook page.
 */
export const mockPage: Page = {
  name: 'summit-weather',
  title: 'Summit Weather Dashboard',
  description: {
    gfm: 'A real-time weather dashboard showing conditions at the summit.',
    html: '<p>A real-time weather dashboard showing conditions at the summit.</p>',
  },
  cache_ttl: 3600,
  date_added: '2024-01-15T10:30:00Z',
  authors: [
    {
      name: 'Vera Rubin',
      username: 'vrubin',
      affiliation_name: 'Rubin Observatory',
      email: 'vrubin@example.com',
      slack_name: 'vrubin',
    },
  ],
  tags: ['weather', 'summit', 'monitoring'],
  uploader_username: null,
  self_url: 'https://data.lsst.cloud/times-square/v1/pages/summit-weather',
  source_url:
    'https://data.lsst.cloud/times-square/v1/pages/summit-weather/source',
  rendered_url:
    'https://data.lsst.cloud/times-square/v1/pages/summit-weather/rendered',
  html_url: 'https://data.lsst.cloud/times-square/v1/pages/summit-weather/html',
  html_status_url:
    'https://data.lsst.cloud/times-square/v1/pages/summit-weather/htmlstatus',
  html_events_url:
    'https://data.lsst.cloud/times-square/v1/pages/summit-weather/html/events',
  parameters: {
    units: {
      type: 'string',
      enum: ['metric', 'imperial'],
      default: 'metric',
      description: 'Temperature units',
    },
    days: {
      type: 'integer',
      minimum: 1,
      maximum: 30,
      default: 7,
      description: 'Number of days to display',
    },
  },
  github: {
    owner: 'lsst-sqre',
    repository: 'times-square-demo',
    source_path: 'weather/summit-weather.ipynb',
    sidecar_path: 'weather/summit-weather.yaml',
  },
};

/**
 * Mock page summary for list endpoints.
 */
export const mockPageSummary: PageSummary = {
  name: 'summit-weather',
  title: 'Summit Weather Dashboard',
  self_url: 'https://data.lsst.cloud/times-square/v1/pages/summit-weather',
};

/**
 * Mock list of page summaries.
 */
export const mockPageSummaries: PageSummary[] = [
  mockPageSummary,
  {
    name: 'image-quality',
    title: 'Image Quality Analysis',
    self_url: 'https://data.lsst.cloud/times-square/v1/pages/image-quality',
  },
  {
    name: 'system-status',
    title: 'System Status Overview',
    self_url: 'https://data.lsst.cloud/times-square/v1/pages/system-status',
  },
];

// =============================================================================
// HTML Status Mock Data
// =============================================================================

/**
 * Mock HTML status when rendering is available.
 */
export const mockHtmlStatusAvailable: HtmlStatus = {
  available: true,
  html_url: 'https://data.lsst.cloud/times-square/v1/pages/summit-weather/html',
  html_hash: 'abc123def456789012345678901234567890abcd',
};

/**
 * Mock HTML status when rendering is in progress.
 */
export const mockHtmlStatusPending: HtmlStatus = {
  available: false,
  html_url: 'https://data.lsst.cloud/times-square/v1/pages/summit-weather/html',
  html_hash: null,
};

// =============================================================================
// HTML Event Mock Data (SSE)
// =============================================================================

/**
 * Mock HTML event for queued execution.
 */
export const mockHtmlEventQueued: HtmlEvent = {
  date_submitted: new Date().toISOString(),
  date_started: null,
  date_finished: null,
  execution_status: 'queued',
  execution_duration: null,
  html_hash: null,
  html_url: 'https://data.lsst.cloud/times-square/v1/pages/summit-weather/html',
};

/**
 * Mock HTML event for in-progress execution.
 */
export const mockHtmlEventInProgress: HtmlEvent = {
  date_submitted: new Date(Date.now() - 5000).toISOString(),
  date_started: new Date(Date.now() - 3000).toISOString(),
  date_finished: null,
  execution_status: 'in_progress',
  execution_duration: null,
  html_hash: null,
  html_url: 'https://data.lsst.cloud/times-square/v1/pages/summit-weather/html',
};

/**
 * Mock HTML event for completed execution.
 */
export const mockHtmlEventComplete: HtmlEvent = {
  date_submitted: new Date(Date.now() - 10000).toISOString(),
  date_started: new Date(Date.now() - 8000).toISOString(),
  date_finished: new Date().toISOString(),
  execution_status: 'complete',
  execution_duration: 8.5,
  html_hash: 'abc123def456789012345678901234567890abcd',
  html_url: 'https://data.lsst.cloud/times-square/v1/pages/summit-weather/html',
};

// =============================================================================
// GitHub Contents Mock Data
// =============================================================================

/**
 * Mock GitHub contents tree.
 */
export const mockGitHubContents: GitHubContentsRoot = {
  contents: [
    {
      node_type: 'owner',
      path: 'lsst-sqre',
      title: 'lsst-sqre',
      contents: [
        {
          node_type: 'repo',
          path: 'lsst-sqre/times-square-demo',
          title: 'times-square-demo',
          contents: [
            {
              node_type: 'directory',
              path: 'lsst-sqre/times-square-demo/weather',
              title: 'weather',
              contents: [
                {
                  node_type: 'page',
                  path: 'lsst-sqre/times-square-demo/weather/summit-weather',
                  title: 'Summit Weather Dashboard',
                  contents: [],
                },
                {
                  node_type: 'page',
                  path: 'lsst-sqre/times-square-demo/weather/forecast',
                  title: 'Weather Forecast',
                  contents: [],
                },
              ],
            },
            {
              node_type: 'directory',
              path: 'lsst-sqre/times-square-demo/analysis',
              title: 'analysis',
              contents: [
                {
                  node_type: 'page',
                  path: 'lsst-sqre/times-square-demo/analysis/image-quality',
                  title: 'Image Quality Analysis',
                  contents: [],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

/**
 * Helper to create a mock content node.
 */
export function createMockContentNode(
  overrides: Partial<ContentNode> = {}
): ContentNode {
  return {
    node_type: 'page',
    path: 'org/repo/notebook',
    title: 'Mock Notebook',
    contents: [],
    ...overrides,
  };
}

// =============================================================================
// GitHub PR Mock Data
// =============================================================================

/**
 * Mock GitHub check run summary for a successful check.
 */
export const mockGitHubCheckSuccess: GitHubCheckRunSummary = {
  status: 'completed',
  conclusion: 'success',
  external_id: 'ts-yaml-check-123',
  head_sha: 'abc123def456',
  name: 'YAML validation',
  html_url: 'https://github.com/lsst-sqre/times-square-demo/runs/123456',
  report_title: 'YAML validation passed',
  report_summary: null,
  report_text: null,
};

/**
 * Mock GitHub check run summary for a failed check.
 */
export const mockGitHubCheckFailure: GitHubCheckRunSummary = {
  status: 'completed',
  conclusion: 'failure',
  external_id: 'ts-nbexec-check-456',
  head_sha: 'abc123def456',
  name: 'Notebook execution',
  html_url: 'https://github.com/lsst-sqre/times-square-demo/runs/789012',
  report_title: 'Notebook execution failed',
  report_summary: {
    gfm: 'The notebook failed to execute.',
    html: '<p>The notebook failed to execute.</p>',
  },
  report_text: null,
};

/**
 * Mock GitHub check run summary for an in-progress check.
 */
export const mockGitHubCheckInProgress: GitHubCheckRunSummary = {
  status: 'in_progress',
  conclusion: null,
  external_id: 'ts-nbexec-check-789',
  head_sha: 'abc123def456',
  name: 'Notebook execution',
  html_url: 'https://github.com/lsst-sqre/times-square-demo/runs/345678',
  report_title: null,
  report_summary: null,
  report_text: null,
};

/**
 * Mock GitHub pull request.
 */
export const mockGitHubPr: GitHubPr = {
  number: 42,
  title: 'Add new weather dashboard',
  conversation_url: 'https://github.com/lsst-sqre/times-square-demo/pull/42',
  contributor: {
    username: 'vrubin',
    html_url: 'https://github.com/vrubin',
    avatar_url: 'https://github.com/vrubin.png',
  },
  state: 'open',
};

/**
 * Mock GitHub PR contents response.
 */
export const mockGitHubPrContents: GitHubPrContents = {
  contents: [
    {
      node_type: 'directory',
      path: 'weather',
      title: 'weather',
      contents: [
        {
          node_type: 'page',
          path: 'weather/summit-weather',
          title: 'Summit Weather Dashboard',
          contents: [],
        },
      ],
    },
  ],
  owner: 'lsst-sqre',
  repo: 'times-square-demo',
  commit: 'abc123def456789012345678901234567890abcd',
  yaml_check: mockGitHubCheckSuccess,
  nbexec_check: mockGitHubCheckInProgress,
  pull_requests: [mockGitHubPr],
};

/**
 * Mock empty GitHub PR contents response.
 */
export const mockEmptyGitHubPrContents: GitHubPrContents = {
  contents: [],
  owner: 'lsst-sqre',
  repo: 'times-square-demo',
  commit: 'abc123def456789012345678901234567890abcd',
  yaml_check: null,
  nbexec_check: null,
  pull_requests: [],
};
