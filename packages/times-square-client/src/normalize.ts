/**
 * Normalization for the GitHub contents tree.
 *
 * Times Square deployments predating the server-side tree-building fix
 * (lsst-sqre/times-square#140) emit duplicate sibling `directory` nodes:
 * a directory at depth >= 2 below a repository appears once per page it
 * contains instead of once with all pages as children. This module merges
 * those duplicates client-side so the sidebar renders each directory
 * exactly once. The pass is idempotent, so it is a no-op against fixed
 * servers.
 */
import type { ContentNode } from './schemas';

/**
 * Recursively merge sibling `directory` nodes that share the same `path`.
 *
 * Duplicate sibling directories are merged into the first occurrence,
 * concatenating their `contents` in encounter order. The merge is applied
 * recursively at every level of the tree, so duplicates surfaced by an
 * earlier merge are also collapsed. The input is not mutated; a clean tree
 * passes through structurally unchanged (idempotent).
 *
 * @param contents - Sibling nodes from a GitHub contents tree
 * @returns Normalized sibling nodes with duplicate directories merged
 */
export function normalizeGitHubContents(
  contents: ContentNode[]
): ContentNode[] {
  const merged: ContentNode[] = [];
  const directoryIndexByPath = new Map<string, number>();

  for (const node of contents) {
    if (node.node_type === 'directory') {
      const existingIndex = directoryIndexByPath.get(node.path);
      if (existingIndex !== undefined) {
        const existing = merged[existingIndex];
        merged[existingIndex] = {
          ...existing,
          contents: [...existing.contents, ...node.contents],
        };
        continue;
      }
      directoryIndexByPath.set(node.path, merged.length);
    }
    merged.push(node);
  }

  return merged.map((node) =>
    node.contents.length > 0
      ? { ...node, contents: normalizeGitHubContents(node.contents) }
      : node
  );
}
