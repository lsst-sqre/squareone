import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Get the directory containing the built-in templates
 *
 * Templates are located at: packages/file-factory/templates/
 */
export function getBuiltInTemplatesDir(): string {
  // In ESM, we need to use import.meta.url to get the current file path
  // This file is at src/utils/paths.ts, templates are at ../../../templates
  const currentDir = path.dirname(fileURLToPath(import.meta.url));

  // When running from source (development)
  const devTemplatesDir = path.resolve(currentDir, '..', 'templates');
  if (fs.existsSync(devTemplatesDir)) {
    return devTemplatesDir;
  }

  // When running from dist (production)
  // dist/utils/paths.js -> templates/
  const distTemplatesDir = path.resolve(currentDir, '..', '..', 'templates');
  if (fs.existsSync(distTemplatesDir)) {
    return distTemplatesDir;
  }

  throw new Error(
    'Could not locate built-in templates directory. ' +
      `Checked: ${devTemplatesDir}, ${distTemplatesDir}`
  );
}

/**
 * Ensure a directory exists, creating it recursively if needed
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.promises.mkdir(dirPath, { recursive: true });
}

/**
 * Check if a path exists
 */
export async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.promises.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a path exists (synchronous)
 */
export function pathExistsSync(targetPath: string): boolean {
  try {
    fs.accessSync(targetPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a file as a string
 */
export async function readFile(filePath: string): Promise<string> {
  return fs.promises.readFile(filePath, 'utf-8');
}

/**
 * Write a string to a file, creating directories as needed
 */
export async function writeFile(
  filePath: string,
  content: string
): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.promises.writeFile(filePath, content, 'utf-8');
}

/**
 * Get relative path from one file to another
 */
export function getRelativePath(from: string, to: string): string {
  const relativePath = path.relative(path.dirname(from), to);
  // Ensure it starts with ./ for relative imports
  if (!relativePath.startsWith('.') && !relativePath.startsWith('/')) {
    return `./${relativePath}`;
  }
  return relativePath;
}

/**
 * Join paths and normalize
 */
export function joinPaths(...segments: string[]): string {
  return path.join(...segments);
}

/**
 * Resolve a path to absolute
 */
export function resolvePath(...segments: string[]): string {
  return path.resolve(...segments);
}

/**
 * Get the directory name of a path
 */
export function getDirname(filePath: string): string {
  return path.dirname(filePath);
}

/**
 * Get the base name of a path
 */
export function getBasename(filePath: string, ext?: string): string {
  return path.basename(filePath, ext);
}

/**
 * Get the extension of a path
 */
export function getExtension(filePath: string): string {
  return path.extname(filePath);
}
