/**
 * Interpolation utilities for handling {{VariableName}} patterns in filenames and templates
 */

/**
 * Pattern to match interpolation variables: {{VariableName}}
 * Supports PascalCase, camelCase, and kebab-case variable names
 */
const INTERPOLATION_PATTERN = /\{\{([a-zA-Z][a-zA-Z0-9-]*)\}\}/g;

/**
 * Interpolate variables in a string
 *
 * Replaces {{VariableName}} patterns with values from the variables object.
 *
 * @example
 * interpolate('{{ComponentName}}.tsx', { ComponentName: 'Button' })
 * // 'Button.tsx'
 *
 * interpolate('src/{{component-name}}/index.ts', { 'component-name': 'data-table' })
 * // 'src/data-table/index.ts'
 */
export function interpolate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(INTERPOLATION_PATTERN, (match, variableName) => {
    if (variableName in variables) {
      return variables[variableName];
    }
    // Leave unmatched variables as-is
    return match;
  });
}

/**
 * Interpolate a filename, also removing the .ejs extension if present
 *
 * @example
 * interpolateFilename('{{ComponentName}}.tsx.ejs', { ComponentName: 'Button' })
 * // 'Button.tsx'
 */
export function interpolateFilename(
  filename: string,
  variables: Record<string, string>
): string {
  let result = interpolate(filename, variables);

  // Remove .ejs extension
  if (result.endsWith('.ejs')) {
    result = result.slice(0, -4);
  }

  return result;
}

/**
 * Extract variable names from a template string
 *
 * @example
 * extractVariables('{{ComponentName}}/{{ComponentName}}.tsx')
 * // ['ComponentName']
 */
export function extractVariables(template: string): string[] {
  const variables = new Set<string>();

  // Reset lastIndex to ensure we start from the beginning
  const pattern = new RegExp(INTERPOLATION_PATTERN.source, 'g');

  let match = pattern.exec(template);
  while (match !== null) {
    variables.add(match[1]);
    match = pattern.exec(template);
  }

  return Array.from(variables);
}

/**
 * Check if a filename is a conditional file based on the _when_ prefix
 *
 * Convention: _when_<condition>_filename.ext
 *
 * @example
 * parseConditionalFilename('_when_withTest_Button.test.tsx.ejs')
 * // { condition: 'withTest', filename: 'Button.test.tsx.ejs' }
 *
 * parseConditionalFilename('Button.tsx.ejs')
 * // null (not conditional)
 */
export function parseConditionalFilename(
  filename: string
): { condition: string; filename: string } | null {
  const match = filename.match(/^_when_([a-zA-Z]+)_(.+)$/);

  if (!match) {
    return null;
  }

  return {
    condition: match[1],
    filename: match[2],
  };
}

/**
 * Check if a conditional file should be included based on the provided flags
 *
 * @example
 * shouldIncludeConditionalFile('_when_withTest_Button.test.tsx.ejs', { withTest: true })
 * // true
 *
 * shouldIncludeConditionalFile('_when_withStory_Button.stories.tsx.ejs', { withStory: false })
 * // false
 *
 * shouldIncludeConditionalFile('Button.tsx.ejs', { withTest: true })
 * // true (non-conditional files are always included)
 */
export function shouldIncludeConditionalFile(
  filename: string,
  flags: Record<string, boolean>
): boolean {
  const parsed = parseConditionalFilename(filename);

  if (!parsed) {
    // Not a conditional file, always include
    return true;
  }

  // Check if the condition is true
  return flags[parsed.condition] === true;
}

/**
 * Get the actual filename from a potentially conditional filename
 *
 * @example
 * getActualFilename('_when_withTest_{{ComponentName}}.test.tsx.ejs')
 * // '{{ComponentName}}.test.tsx.ejs'
 *
 * getActualFilename('{{ComponentName}}.tsx.ejs')
 * // '{{ComponentName}}.tsx.ejs'
 */
export function getActualFilename(filename: string): string {
  const parsed = parseConditionalFilename(filename);
  return parsed ? parsed.filename : filename;
}
