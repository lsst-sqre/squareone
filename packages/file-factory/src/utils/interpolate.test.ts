import { describe, expect, it } from 'vitest';
import {
  extractVariables,
  getActualFilename,
  interpolate,
  interpolateFilename,
  parseConditionalFilename,
  shouldIncludeConditionalFile,
} from './interpolate.js';

describe('interpolate', () => {
  it('replaces single variable', () => {
    const result = interpolate('{{ComponentName}}.tsx', {
      ComponentName: 'Button',
    });
    expect(result).toBe('Button.tsx');
  });

  it('replaces multiple variables', () => {
    const result = interpolate('{{ComponentName}}/{{ComponentName}}.tsx', {
      ComponentName: 'Button',
    });
    expect(result).toBe('Button/Button.tsx');
  });

  it('replaces different variables', () => {
    const result = interpolate('{{hookName}}/{{hookName}}.ts', {
      hookName: 'useDebounce',
    });
    expect(result).toBe('useDebounce/useDebounce.ts');
  });

  it('handles kebab-case variables', () => {
    const result = interpolate('{{component-name}}/index.ts', {
      'component-name': 'data-table',
    });
    expect(result).toBe('data-table/index.ts');
  });

  it('leaves unmatched variables as-is', () => {
    const result = interpolate('{{ComponentName}}/{{unknown}}.tsx', {
      ComponentName: 'Button',
    });
    expect(result).toBe('Button/{{unknown}}.tsx');
  });

  it('handles empty variables object', () => {
    const result = interpolate('{{ComponentName}}.tsx', {});
    expect(result).toBe('{{ComponentName}}.tsx');
  });
});

describe('interpolateFilename', () => {
  it('interpolates and removes .ejs extension', () => {
    const result = interpolateFilename('{{ComponentName}}.tsx.ejs', {
      ComponentName: 'Button',
    });
    expect(result).toBe('Button.tsx');
  });

  it('handles filenames without .ejs extension', () => {
    const result = interpolateFilename('{{ComponentName}}.tsx', {
      ComponentName: 'Button',
    });
    expect(result).toBe('Button.tsx');
  });

  it('handles CSS module filenames', () => {
    const result = interpolateFilename('{{ComponentName}}.module.css.ejs', {
      ComponentName: 'Button',
    });
    expect(result).toBe('Button.module.css');
  });
});

describe('extractVariables', () => {
  it('extracts single variable', () => {
    const result = extractVariables('{{ComponentName}}.tsx');
    expect(result).toEqual(['ComponentName']);
  });

  it('extracts multiple unique variables', () => {
    const result = extractVariables('{{ComponentName}}/{{componentName}}.tsx');
    expect(result).toContain('ComponentName');
    expect(result).toContain('componentName');
  });

  it('deduplicates repeated variables', () => {
    const result = extractVariables('{{ComponentName}}/{{ComponentName}}.tsx');
    expect(result).toEqual(['ComponentName']);
  });

  it('extracts kebab-case variables', () => {
    const result = extractVariables('{{component-name}}/index.ts');
    expect(result).toEqual(['component-name']);
  });

  it('returns empty array for no variables', () => {
    const result = extractVariables('index.ts');
    expect(result).toEqual([]);
  });
});

describe('parseConditionalFilename', () => {
  it('parses conditional filename with _when_ prefix', () => {
    const result = parseConditionalFilename(
      '_when_withTest_Button.test.tsx.ejs'
    );
    expect(result).toEqual({
      condition: 'withTest',
      filename: 'Button.test.tsx.ejs',
    });
  });

  it('returns null for non-conditional filename', () => {
    const result = parseConditionalFilename('Button.tsx.ejs');
    expect(result).toBeNull();
  });

  it('handles complex filenames', () => {
    const result = parseConditionalFilename(
      '_when_withStory_{{ComponentName}}.stories.tsx.ejs'
    );
    expect(result).toEqual({
      condition: 'withStory',
      filename: '{{ComponentName}}.stories.tsx.ejs',
    });
  });
});

describe('shouldIncludeConditionalFile', () => {
  it('includes file when condition is true', () => {
    const result = shouldIncludeConditionalFile(
      '_when_withTest_Button.test.tsx.ejs',
      { withTest: true }
    );
    expect(result).toBe(true);
  });

  it('excludes file when condition is false', () => {
    const result = shouldIncludeConditionalFile(
      '_when_withTest_Button.test.tsx.ejs',
      { withTest: false }
    );
    expect(result).toBe(false);
  });

  it('excludes file when condition is not in flags', () => {
    const result = shouldIncludeConditionalFile(
      '_when_withTest_Button.test.tsx.ejs',
      { withStory: true }
    );
    expect(result).toBe(false);
  });

  it('always includes non-conditional files', () => {
    const result = shouldIncludeConditionalFile('Button.tsx.ejs', {
      withTest: false,
    });
    expect(result).toBe(true);
  });
});

describe('getActualFilename', () => {
  it('removes _when_ prefix from conditional filename', () => {
    const result = getActualFilename('_when_withTest_Button.test.tsx.ejs');
    expect(result).toBe('Button.test.tsx.ejs');
  });

  it('returns non-conditional filename as-is', () => {
    const result = getActualFilename('Button.tsx.ejs');
    expect(result).toBe('Button.tsx.ejs');
  });

  it('handles interpolation variables', () => {
    const result = getActualFilename(
      '_when_withStory_{{ComponentName}}.stories.tsx.ejs'
    );
    expect(result).toBe('{{ComponentName}}.stories.tsx.ejs');
  });
});
