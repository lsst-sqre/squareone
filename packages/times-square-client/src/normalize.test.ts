/**
 * Tests for GitHub contents tree normalization.
 */
import { describe, expect, it } from 'vitest';

import {
  mockGitHubContentsDuplicateDirectories,
  mockGitHubContentsNested,
} from './mock-data';
import { normalizeGitHubContents } from './normalize';
import type { ContentNode } from './schemas';

/** Shorthand for building a content node. */
function node(
  nodeType: ContentNode['node_type'],
  path: string,
  contents: ContentNode[] = []
): ContentNode {
  return {
    node_type: nodeType,
    path,
    title: path.split('/').pop() ?? path,
    contents,
  };
}

describe('normalizeGitHubContents', () => {
  it('merges duplicate sibling directory nodes, concatenating contents', () => {
    const input: ContentNode[] = [
      node('directory', 'owner/repo/sst/mtm1m3', [
        node('page', 'owner/repo/sst/mtm1m3/notebook-a'),
      ]),
      node('directory', 'owner/repo/sst/mtm1m3', [
        node('page', 'owner/repo/sst/mtm1m3/notebook-b'),
      ]),
    ];

    const result = normalizeGitHubContents(input);

    expect(result).toHaveLength(1);
    expect(result[0].path).toBe('owner/repo/sst/mtm1m3');
    expect(result[0].contents.map((child) => child.path)).toEqual([
      'owner/repo/sst/mtm1m3/notebook-a',
      'owner/repo/sst/mtm1m3/notebook-b',
    ]);
  });

  it('keeps the merged directory at the position of its first occurrence', () => {
    const input: ContentNode[] = [
      node('directory', 'o/r/alpha', [node('page', 'o/r/alpha/one')]),
      node('directory', 'o/r/beta', [node('page', 'o/r/beta/one')]),
      node('directory', 'o/r/alpha', [node('page', 'o/r/alpha/two')]),
      node('page', 'o/r/readme'),
    ];

    const result = normalizeGitHubContents(input);

    expect(result.map((n) => n.path)).toEqual([
      'o/r/alpha',
      'o/r/beta',
      'o/r/readme',
    ]);
    expect(result[0].contents.map((child) => child.path)).toEqual([
      'o/r/alpha/one',
      'o/r/alpha/two',
    ]);
  });

  it('merges duplicates recursively at deeper levels of the tree', () => {
    const input: ContentNode[] = [
      node('owner', 'lsst-so', [
        node('repo', 'lsst-so/reports', [
          node('directory', 'lsst-so/reports/sst', [
            node('directory', 'lsst-so/reports/sst/mtm1m3', [
              node('page', 'lsst-so/reports/sst/mtm1m3/nb1'),
            ]),
            node('directory', 'lsst-so/reports/sst/mtm1m3', [
              node('page', 'lsst-so/reports/sst/mtm1m3/nb2'),
            ]),
            node('directory', 'lsst-so/reports/sst/nights', [
              node('page', 'lsst-so/reports/sst/nights/nb3'),
            ]),
          ]),
        ]),
      ]),
    ];

    const result = normalizeGitHubContents(input);

    const sst = result[0].contents[0].contents[0];
    expect(sst.path).toBe('lsst-so/reports/sst');
    expect(sst.contents.map((child) => child.path)).toEqual([
      'lsst-so/reports/sst/mtm1m3',
      'lsst-so/reports/sst/nights',
    ]);
    expect(sst.contents[0].contents.map((child) => child.path)).toEqual([
      'lsst-so/reports/sst/mtm1m3/nb1',
      'lsst-so/reports/sst/mtm1m3/nb2',
    ]);
  });

  it('collapses duplicates surfaced by an earlier merge', () => {
    // Two duplicate parents each carrying a duplicate child: after the
    // parents merge, their children become duplicate siblings and must
    // also merge.
    const input: ContentNode[] = [
      node('directory', 'o/r/dir', [
        node('directory', 'o/r/dir/sub', [node('page', 'o/r/dir/sub/nb1')]),
      ]),
      node('directory', 'o/r/dir', [
        node('directory', 'o/r/dir/sub', [node('page', 'o/r/dir/sub/nb2')]),
      ]),
    ];

    const result = normalizeGitHubContents(input);

    expect(result).toHaveLength(1);
    expect(result[0].contents).toHaveLength(1);
    expect(result[0].contents[0].path).toBe('o/r/dir/sub');
    expect(result[0].contents[0].contents.map((child) => child.path)).toEqual([
      'o/r/dir/sub/nb1',
      'o/r/dir/sub/nb2',
    ]);
  });

  it('passes a clean tree through unchanged (idempotent)', () => {
    const clean: ContentNode[] = [
      node('owner', 'lsst-sqre', [
        node('repo', 'lsst-sqre/demo', [
          node('directory', 'lsst-sqre/demo/weather', [
            node('page', 'lsst-sqre/demo/weather/summit'),
            node('page', 'lsst-sqre/demo/weather/forecast'),
          ]),
          node('page', 'lsst-sqre/demo/index'),
        ]),
      ]),
    ];

    const once = normalizeGitHubContents(clean);
    expect(once).toEqual(clean);

    const twice = normalizeGitHubContents(once);
    expect(twice).toEqual(once);
  });

  it('does not merge non-directory nodes that share a path', () => {
    const input: ContentNode[] = [
      node('page', 'o/r/notebook'),
      node('page', 'o/r/notebook'),
    ];

    const result = normalizeGitHubContents(input);

    expect(result).toHaveLength(2);
  });

  it('does not mutate the input tree', () => {
    const input: ContentNode[] = [
      node('directory', 'o/r/dir', [node('page', 'o/r/dir/nb1')]),
      node('directory', 'o/r/dir', [node('page', 'o/r/dir/nb2')]),
    ];
    const snapshot = structuredClone(input);

    normalizeGitHubContents(input);

    expect(input).toEqual(snapshot);
  });

  it('returns an empty array for empty contents', () => {
    expect(normalizeGitHubContents([])).toEqual([]);
  });

  it('passes the nested mock fixture through unchanged', () => {
    const result = normalizeGitHubContents(mockGitHubContentsNested.contents);

    expect(result).toEqual(mockGitHubContentsNested.contents);
  });

  it('normalizes the duplicate-directory mock fixture to one node per path', () => {
    const result = normalizeGitHubContents(
      mockGitHubContentsDuplicateDirectories.contents
    );

    // Collect every directory path in the normalized tree and assert each
    // appears exactly once among its siblings.
    const seen: string[] = [];
    const walk = (nodes: ContentNode[]): void => {
      const directoryPaths = nodes
        .filter((n) => n.node_type === 'directory')
        .map((n) => n.path);
      expect(new Set(directoryPaths).size).toBe(directoryPaths.length);
      seen.push(...directoryPaths);
      for (const n of nodes) {
        walk(n.contents);
      }
    };
    walk(result);
    expect(seen.length).toBeGreaterThan(0);

    // All notebooks survive the merge: the sst/mtm1m3 directory holds every
    // page that was scattered across its duplicates.
    const owner = result[0];
    const repo = owner.contents[0];
    const sst = repo.contents.find(
      (n) => n.path === 'lsst-so/reports-performance-summary/sst'
    );
    expect(sst).toBeDefined();
    const mtm1m3 = sst?.contents.find(
      (n) => n.path === 'lsst-so/reports-performance-summary/sst/mtm1m3'
    );
    expect(mtm1m3?.contents.map((n) => n.path)).toEqual([
      'lsst-so/reports-performance-summary/sst/mtm1m3/nb1',
      'lsst-so/reports-performance-summary/sst/mtm1m3/nb2',
      'lsst-so/reports-performance-summary/sst/mtm1m3/nb3',
    ]);
  });
});
