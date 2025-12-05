import * as fs from 'node:fs';
import * as path from 'node:path';
import ejs from 'ejs';
import glob from 'fast-glob';
import {
  getActualFilename,
  interpolateFilename,
  shouldIncludeConditionalFile,
} from './interpolate.js';
import { ensureDir, readFile, writeFile } from './paths.js';

/**
 * Template file information
 */
export interface TemplateFile {
  /** Relative path within the template directory */
  relativePath: string;
  /** Absolute path to the template file */
  absolutePath: string;
  /** Whether this is a directory */
  isDirectory: boolean;
}

/**
 * Discover all template files in a directory
 *
 * Returns files in order suitable for processing (directories first)
 */
export async function discoverTemplateFiles(
  templatesDir: string
): Promise<TemplateFile[]> {
  const entries = await glob('**/*', {
    cwd: templatesDir,
    dot: true,
    onlyFiles: false,
    markDirectories: true,
  });

  const templateFiles: TemplateFile[] = [];

  for (const entry of entries) {
    const isDirectory = entry.endsWith('/');
    const relativePath = isDirectory ? entry.slice(0, -1) : entry;
    const absolutePath = path.join(templatesDir, relativePath);

    templateFiles.push({
      relativePath,
      absolutePath,
      isDirectory,
    });
  }

  // Sort to ensure directories come before their contents
  templateFiles.sort((a, b) => {
    // Directories first
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    // Then by path length (shorter first)
    return a.relativePath.localeCompare(b.relativePath);
  });

  return templateFiles;
}

/**
 * Render an EJS template string with the provided data
 */
export function renderTemplate(
  template: string,
  data: Record<string, unknown>
): string {
  return ejs.render(template, data, {
    // Don't escape HTML entities
    escape: (str: string) => str,
  });
}

/**
 * Render an EJS template file with the provided data
 */
export async function renderTemplateFile(
  templatePath: string,
  data: Record<string, unknown>
): Promise<string> {
  const template = await readFile(templatePath);
  return renderTemplate(template, data);
}

/**
 * Options for processing templates
 */
export interface ProcessTemplatesOptions {
  /** Path to the template directory */
  templatesDir: string;
  /** Target directory for output */
  targetDir: string;
  /** Variables for filename interpolation */
  filenameVariables: Record<string, string>;
  /** Data for template rendering */
  templateData: Record<string, unknown>;
  /** Flags for conditional file inclusion */
  conditionalFlags: Record<string, boolean>;
  /** Dry run mode - don't write files */
  dryRun?: boolean;
}

/**
 * Result of processing templates
 */
export interface ProcessTemplatesResult {
  /** List of created files (absolute paths) */
  createdFiles: string[];
  /** List of created directories (absolute paths) */
  createdDirectories: string[];
  /** List of skipped files (conditional files that weren't included) */
  skippedFiles: string[];
}

/**
 * Process a template directory and generate output files
 *
 * This function:
 * 1. Walks the template directory tree
 * 2. Interpolates {{VariableName}} in filenames
 * 3. Handles conditional files (_when_condition_filename)
 * 4. Processes .ejs files through the EJS template engine
 * 5. Writes the results to the target directory
 */
export async function processTemplates(
  options: ProcessTemplatesOptions
): Promise<ProcessTemplatesResult> {
  const {
    templatesDir,
    targetDir,
    filenameVariables,
    templateData,
    conditionalFlags,
    dryRun = false,
  } = options;

  const result: ProcessTemplatesResult = {
    createdFiles: [],
    createdDirectories: [],
    skippedFiles: [],
  };

  // Discover all template files
  const templateFiles = await discoverTemplateFiles(templatesDir);

  for (const templateFile of templateFiles) {
    const { relativePath, absolutePath, isDirectory } = templateFile;

    // Get the filename (last segment of path)
    const segments = relativePath.split('/');
    const filename = segments[segments.length - 1];

    // Check conditional inclusion
    if (!shouldIncludeConditionalFile(filename, conditionalFlags)) {
      result.skippedFiles.push(absolutePath);
      continue;
    }

    // Get actual filename (without _when_ prefix)
    const actualFilename = getActualFilename(filename);

    // Interpolate the filename
    const interpolatedFilename = interpolateFilename(
      actualFilename,
      filenameVariables
    );

    // Build the full target path
    const parentPath = segments.slice(0, -1).join('/');
    const interpolatedParentPath = parentPath
      ? interpolateFilename(parentPath, filenameVariables)
      : '';
    const targetPath = path.join(
      targetDir,
      interpolatedParentPath,
      interpolatedFilename
    );

    if (isDirectory) {
      // Create directory
      if (!dryRun) {
        await ensureDir(targetPath);
      }
      result.createdDirectories.push(targetPath);
    } else {
      // Process file
      const isEjsTemplate = absolutePath.endsWith('.ejs');

      let content: string;
      if (isEjsTemplate) {
        // Render EJS template
        content = await renderTemplateFile(absolutePath, templateData);
      } else {
        // Copy file as-is
        content = await readFile(absolutePath);
      }

      if (!dryRun) {
        await writeFile(targetPath, content);
      }
      result.createdFiles.push(targetPath);
    }
  }

  return result;
}

/**
 * Check if a template directory exists
 */
export function templateExists(templatesDir: string): boolean {
  return fs.existsSync(templatesDir);
}

/**
 * Get available template types in a directory
 */
export async function getAvailableTemplateTypes(
  templatesDir: string
): Promise<string[]> {
  if (!fs.existsSync(templatesDir)) {
    return [];
  }

  const entries = await fs.promises.readdir(templatesDir, {
    withFileTypes: true,
  });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}
