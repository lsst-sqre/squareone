/**
 * Tests for Times Square Zod schemas.
 */
import { describe, expect, it } from 'vitest';

import {
  mockGitHubCheckSuccess,
  mockGitHubContents,
  mockGitHubPr,
  mockGitHubPrContents,
  mockHtmlEventComplete,
  mockHtmlStatusAvailable,
  mockPage,
  mockPageSummary,
} from './mock-data';
import {
  ErrorDetailSchema,
  ErrorModelSchema,
  ExecutionStatusSchema,
  FormattedTextSchema,
  GitHubCheckRunConclusionSchema,
  GitHubCheckRunStatusSchema,
  GitHubCheckRunSummarySchema,
  GitHubContentsNodeSchema,
  GitHubContentsRootSchema,
  GitHubContributorSchema,
  GitHubNodeTypeSchema,
  GitHubPrContentsSchema,
  GitHubPrSchema,
  GitHubPrStateSchema,
  GitHubSourceMetadataSchema,
  HtmlEventSchema,
  HtmlStatusSchema,
  PageSchema,
  PageSummarySchema,
  PersonSchema,
} from './schemas';

describe('GitHubNodeTypeSchema', () => {
  it('accepts valid node types', () => {
    expect(GitHubNodeTypeSchema.parse('owner')).toBe('owner');
    expect(GitHubNodeTypeSchema.parse('repo')).toBe('repo');
    expect(GitHubNodeTypeSchema.parse('directory')).toBe('directory');
    expect(GitHubNodeTypeSchema.parse('page')).toBe('page');
  });

  it('rejects invalid node types', () => {
    expect(() => GitHubNodeTypeSchema.parse('invalid')).toThrow();
    expect(() => GitHubNodeTypeSchema.parse('')).toThrow();
    expect(() => GitHubNodeTypeSchema.parse(123)).toThrow();
  });
});

describe('ExecutionStatusSchema', () => {
  it('accepts valid execution statuses', () => {
    expect(ExecutionStatusSchema.parse('queued')).toBe('queued');
    expect(ExecutionStatusSchema.parse('in_progress')).toBe('in_progress');
    expect(ExecutionStatusSchema.parse('complete')).toBe('complete');
  });

  it('rejects invalid statuses', () => {
    expect(() => ExecutionStatusSchema.parse('running')).toThrow();
    expect(() => ExecutionStatusSchema.parse('done')).toThrow();
  });
});

describe('GitHubCheckRunStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(GitHubCheckRunStatusSchema.parse('queued')).toBe('queued');
    expect(GitHubCheckRunStatusSchema.parse('in_progress')).toBe('in_progress');
    expect(GitHubCheckRunStatusSchema.parse('completed')).toBe('completed');
  });
});

describe('GitHubCheckRunConclusionSchema', () => {
  it('accepts valid conclusions', () => {
    const conclusions = [
      'success',
      'failure',
      'neutral',
      'cancelled',
      'timed_out',
      'action_required',
      'stale',
    ];
    for (const conclusion of conclusions) {
      expect(GitHubCheckRunConclusionSchema.parse(conclusion)).toBe(conclusion);
    }
  });
});

describe('GitHubPrStateSchema', () => {
  it('accepts valid PR states', () => {
    expect(GitHubPrStateSchema.parse('draft')).toBe('draft');
    expect(GitHubPrStateSchema.parse('open')).toBe('open');
    expect(GitHubPrStateSchema.parse('merged')).toBe('merged');
    expect(GitHubPrStateSchema.parse('closed')).toBe('closed');
  });
});

describe('FormattedTextSchema', () => {
  it('accepts valid formatted text', () => {
    const result = FormattedTextSchema.parse({
      gfm: '# Hello',
      html: '<h1>Hello</h1>',
    });
    expect(result.gfm).toBe('# Hello');
    expect(result.html).toBe('<h1>Hello</h1>');
  });

  it('requires both fields', () => {
    expect(() => FormattedTextSchema.parse({ gfm: 'text' })).toThrow();
    expect(() => FormattedTextSchema.parse({ html: 'text' })).toThrow();
  });
});

describe('PersonSchema', () => {
  it('accepts person with all fields', () => {
    const result = PersonSchema.parse({
      name: 'Vera Rubin',
      username: 'vrubin',
      affiliation_name: 'Rubin Observatory',
      email: 'vrubin@example.com',
      slack_name: 'vrubin',
    });
    expect(result.name).toBe('Vera Rubin');
    expect(result.username).toBe('vrubin');
  });

  it('accepts person with only name', () => {
    const result = PersonSchema.parse({ name: 'Test User' });
    expect(result.name).toBe('Test User');
    expect(result.username).toBeUndefined();
  });

  it('accepts null optional fields', () => {
    const result = PersonSchema.parse({
      name: 'Test',
      username: null,
      email: null,
    });
    expect(result.username).toBeNull();
  });
});

describe('GitHubSourceMetadataSchema', () => {
  it('accepts valid GitHub source', () => {
    const result = GitHubSourceMetadataSchema.parse({
      owner: 'lsst-sqre',
      repository: 'times-square-demo',
      source_path: 'notebooks/demo.ipynb',
      sidecar_path: 'notebooks/demo.yaml',
    });
    expect(result.owner).toBe('lsst-sqre');
    expect(result.repository).toBe('times-square-demo');
  });

  it('requires all fields', () => {
    expect(() =>
      GitHubSourceMetadataSchema.parse({ owner: 'lsst-sqre' })
    ).toThrow();
  });
});

describe('GitHubContributorSchema', () => {
  it('accepts valid contributor', () => {
    const result = GitHubContributorSchema.parse({
      username: 'vrubin',
      html_url: 'https://github.com/vrubin',
      avatar_url: 'https://github.com/vrubin.png',
    });
    expect(result.username).toBe('vrubin');
  });
});

describe('GitHubContentsNodeSchema', () => {
  it('parses mock contents', () => {
    const result = GitHubContentsRootSchema.parse(mockGitHubContents);
    expect(result.contents).toHaveLength(1);
    expect(result.contents[0].node_type).toBe('owner');
  });

  it('handles deeply nested structure', () => {
    const nested = {
      node_type: 'owner',
      path: 'org',
      title: 'Organization',
      contents: [
        {
          node_type: 'repo',
          path: 'org/repo',
          title: 'Repository',
          contents: [
            {
              node_type: 'page',
              path: 'org/repo/notebook',
              title: 'Notebook',
              contents: [],
            },
          ],
        },
      ],
    };
    const result = GitHubContentsNodeSchema.parse(nested);
    expect(result.contents[0].contents[0].node_type).toBe('page');
  });
});

describe('GitHubCheckRunSummarySchema', () => {
  it('parses mock check success', () => {
    const result = GitHubCheckRunSummarySchema.parse(mockGitHubCheckSuccess);
    expect(result.status).toBe('completed');
    expect(result.conclusion).toBe('success');
  });

  it('accepts null conclusion for in-progress check', () => {
    const result = GitHubCheckRunSummarySchema.parse({
      status: 'in_progress',
      conclusion: null,
      head_sha: 'abc123',
      name: 'Test Check',
      html_url: 'https://github.com/runs/123',
    });
    expect(result.conclusion).toBeNull();
  });
});

describe('GitHubPrSchema', () => {
  it('parses mock PR', () => {
    const result = GitHubPrSchema.parse(mockGitHubPr);
    expect(result.number).toBe(42);
    expect(result.state).toBe('open');
  });
});

describe('GitHubPrContentsSchema', () => {
  it('parses mock PR contents', () => {
    const result = GitHubPrContentsSchema.parse(mockGitHubPrContents);
    expect(result.owner).toBe('lsst-sqre');
    expect(result.pull_requests).toHaveLength(1);
    expect(result.yaml_check).not.toBeNull();
    expect(result.nbexec_check).not.toBeNull();
  });
});

describe('PageSummarySchema', () => {
  it('parses mock page summary', () => {
    const result = PageSummarySchema.parse(mockPageSummary);
    expect(result.name).toBe('summit-weather');
    expect(result.title).toBe('Summit Weather Dashboard');
  });
});

describe('PageSchema', () => {
  it('parses mock page', () => {
    const result = PageSchema.parse(mockPage);
    expect(result.name).toBe('summit-weather');
    expect(result.title).toBe('Summit Weather Dashboard');
    expect(result.authors).toHaveLength(1);
    expect(result.parameters).toHaveProperty('units');
    expect(result.github).not.toBeNull();
  });

  it('accepts page with null github', () => {
    const pageWithoutGitHub = { ...mockPage, github: null };
    const result = PageSchema.parse(pageWithoutGitHub);
    expect(result.github).toBeNull();
  });

  it('accepts page with null description', () => {
    const pageWithoutDesc = { ...mockPage, description: null };
    const result = PageSchema.parse(pageWithoutDesc);
    expect(result.description).toBeNull();
  });
});

describe('HtmlStatusSchema', () => {
  it('parses available status', () => {
    const result = HtmlStatusSchema.parse(mockHtmlStatusAvailable);
    expect(result.available).toBe(true);
    expect(result.html_hash).not.toBeNull();
  });

  it('parses pending status', () => {
    const result = HtmlStatusSchema.parse({
      available: false,
      html_url: 'https://example.com/html',
      html_hash: null,
    });
    expect(result.available).toBe(false);
    expect(result.html_hash).toBeNull();
  });
});

describe('HtmlEventSchema', () => {
  it('parses complete event', () => {
    const result = HtmlEventSchema.parse(mockHtmlEventComplete);
    expect(result.execution_status).toBe('complete');
    expect(result.html_hash).not.toBeNull();
    expect(result.execution_duration).not.toBeNull();
  });

  it('parses queued event with nulls', () => {
    const result = HtmlEventSchema.parse({
      date_submitted: new Date().toISOString(),
      date_started: null,
      date_finished: null,
      execution_status: 'queued',
      execution_duration: null,
      html_hash: null,
      html_url: 'https://example.com/html',
    });
    expect(result.execution_status).toBe('queued');
    expect(result.date_started).toBeNull();
    expect(result.date_finished).toBeNull();
  });
});

describe('ErrorDetailSchema', () => {
  it('accepts error with location', () => {
    const result = ErrorDetailSchema.parse({
      loc: ['body', 'param'],
      msg: 'field required',
      type: 'value_error.missing',
    });
    expect(result.loc).toEqual(['body', 'param']);
    expect(result.msg).toBe('field required');
  });

  it('accepts error with numeric location', () => {
    const result = ErrorDetailSchema.parse({
      loc: ['body', 0, 'field'],
      msg: 'invalid',
      type: 'type_error',
    });
    expect(result.loc).toEqual(['body', 0, 'field']);
  });

  it('accepts error without location', () => {
    const result = ErrorDetailSchema.parse({
      msg: 'error message',
      type: 'error',
    });
    expect(result.loc).toBeUndefined();
  });
});

describe('ErrorModelSchema', () => {
  it('accepts array of error details', () => {
    const result = ErrorModelSchema.parse({
      detail: [
        { loc: ['body', 'field'], msg: 'required', type: 'missing' },
        { msg: 'invalid', type: 'type_error' },
      ],
    });
    expect(result.detail).toHaveLength(2);
  });

  it('requires detail field', () => {
    expect(() => ErrorModelSchema.parse({})).toThrow();
  });
});
