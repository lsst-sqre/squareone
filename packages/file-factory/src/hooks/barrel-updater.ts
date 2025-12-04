import * as path from 'node:path';
import type { BarrelUpdate } from '../config/schema.js';
import { interpolate } from '../utils/interpolate.js';
import { pathExists, readFile, writeFile } from '../utils/paths.js';

/**
 * Default header comment for auto-generated barrel files
 */
const DEFAULT_BARREL_HEADER = '// Auto-generated barrel file\n\n';

/**
 * Options for updating a barrel file
 */
export interface UpdateBarrelOptions {
  /** Barrel update configuration */
  barrelUpdate: BarrelUpdate;
  /** Variables for template interpolation */
  variables: Record<string, string>;
  /** Package root directory */
  packageRoot: string;
  /** Dry run mode - don't write files */
  dryRun?: boolean;
}

/**
 * Result of a barrel update operation
 */
export interface UpdateBarrelResult {
  /** Path to the barrel file */
  filePath: string;
  /** Whether the file was created */
  created: boolean;
  /** Whether the file was updated */
  updated: boolean;
  /** Whether the update was skipped (export already exists) */
  skipped: boolean;
  /** The export line that was added (or would have been added) */
  exportLine: string;
}

/**
 * Parse exports from a barrel file content
 *
 * Extracts all export statements to check for duplicates
 */
function parseExports(content: string): string[] {
  const exports: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('export ')) {
      exports.push(trimmed);
    }
  }

  return exports;
}

/**
 * Check if an export already exists in the content
 *
 * Compares normalized versions of the export statements
 */
function exportExists(content: string, exportLine: string): boolean {
  const normalizedExport = exportLine.trim().replace(/\s+/g, ' ');
  const existingExports = parseExports(content);

  return existingExports.some((existing) => {
    const normalized = existing.replace(/\s+/g, ' ');
    return normalized === normalizedExport;
  });
}

/**
 * Insert an export line alphabetically into the content
 *
 * Sorts export statements alphabetically while preserving non-export content
 */
function insertAlphabetically(content: string, exportLine: string): string {
  const lines = content.split('\n');
  const exportLines: string[] = [];
  const otherLines: string[] = [];
  const headerLines: string[] = [];

  // Separate exports from other content
  let inHeader = true;
  for (const line of lines) {
    const trimmed = line.trim();

    // Detect header (comments at the start)
    if (inHeader && (trimmed.startsWith('//') || trimmed === '')) {
      headerLines.push(line);
      continue;
    }
    inHeader = false;

    if (trimmed.startsWith('export ')) {
      exportLines.push(trimmed);
    } else if (trimmed !== '') {
      otherLines.push(line);
    }
  }

  // Add new export and sort
  exportLines.push(exportLine.trim());
  exportLines.sort((a, b) => {
    // Extract the path or name being exported for comparison
    const extractSortKey = (exp: string): string => {
      // Match export { X } from './path' or export * from './path'
      const fromMatch = exp.match(/from\s+['"]([^'"]+)['"]/);
      if (fromMatch) return fromMatch[1];
      // Match export { X }
      const namedMatch = exp.match(/export\s*\{\s*([^}]+)\s*\}/);
      if (namedMatch) return namedMatch[1].trim();
      return exp;
    };
    return extractSortKey(a).localeCompare(extractSortKey(b));
  });

  // Reconstruct content
  const parts: string[] = [];

  if (headerLines.length > 0) {
    parts.push(headerLines.join('\n'));
  }

  if (exportLines.length > 0) {
    parts.push(exportLines.join('\n'));
  }

  if (otherLines.length > 0) {
    parts.push(otherLines.join('\n'));
  }

  return `${parts.join('\n')}\n`;
}

/**
 * Update a barrel file with a new export
 *
 * Handles:
 * - Creating the file if it doesn't exist
 * - Checking for duplicate exports
 * - Inserting at the specified position (append, prepend, alphabetical)
 */
export async function updateBarrel(
  options: UpdateBarrelOptions
): Promise<UpdateBarrelResult> {
  const { barrelUpdate, variables, packageRoot, dryRun = false } = options;
  const { file, template, position, skipIfExists } = barrelUpdate;

  const filePath = path.join(packageRoot, file);
  const exportLine = interpolate(template, variables);

  const result: UpdateBarrelResult = {
    filePath,
    created: false,
    updated: false,
    skipped: false,
    exportLine,
  };

  // Check if file exists
  const fileExists = await pathExists(filePath);

  let content: string;
  if (fileExists) {
    content = await readFile(filePath);

    // Check if export already exists
    if (skipIfExists && exportExists(content, exportLine)) {
      result.skipped = true;
      return result;
    }
  } else {
    content = DEFAULT_BARREL_HEADER;
    result.created = true;
  }

  // Insert export at specified position
  let newContent: string;
  switch (position) {
    case 'prepend': {
      // Find the first non-comment, non-empty line
      const lines = content.split('\n');
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        const trimmed = lines[i].trim();
        if (trimmed !== '' && !trimmed.startsWith('//')) {
          insertIndex = i;
          break;
        }
        insertIndex = i + 1;
      }
      lines.splice(insertIndex, 0, exportLine.trim());
      newContent = lines.join('\n');
      break;
    }

    case 'alphabetical':
      newContent = insertAlphabetically(content, exportLine);
      break;

    default:
      // Ensure content ends with newline, then add export
      newContent = `${content.trimEnd()}\n${exportLine.trim()}\n`;
      break;
  }

  // Write the file
  if (!dryRun) {
    await writeFile(filePath, newContent);
  }

  result.updated = true;
  return result;
}

/**
 * Update multiple barrel files
 */
export async function updateBarrels(
  barrelUpdates: BarrelUpdate[],
  variables: Record<string, string>,
  packageRoot: string,
  dryRun = false
): Promise<UpdateBarrelResult[]> {
  const results: UpdateBarrelResult[] = [];

  for (const barrelUpdate of barrelUpdates) {
    const result = await updateBarrel({
      barrelUpdate,
      variables,
      packageRoot,
      dryRun,
    });
    results.push(result);
  }

  return results;
}
