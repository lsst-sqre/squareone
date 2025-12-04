import { describe, expect, it } from 'vitest';
import {
  getComponentNames,
  getContextNames,
  getPageNames,
  normalizeHookName,
  toCamelCase,
  toKebabCase,
  toPascalCase,
  toSnakeCase,
} from './naming.js';

describe('toPascalCase', () => {
  it('converts kebab-case to PascalCase', () => {
    expect(toPascalCase('my-component')).toBe('MyComponent');
    expect(toPascalCase('data-table-row')).toBe('DataTableRow');
  });

  it('converts camelCase to PascalCase', () => {
    expect(toPascalCase('myComponent')).toBe('MyComponent');
    expect(toPascalCase('dataTableRow')).toBe('DataTableRow');
  });

  it('converts snake_case to PascalCase', () => {
    expect(toPascalCase('my_component')).toBe('MyComponent');
    expect(toPascalCase('data_table_row')).toBe('DataTableRow');
  });

  it('preserves existing PascalCase', () => {
    expect(toPascalCase('MyComponent')).toBe('MyComponent');
    expect(toPascalCase('DataTable')).toBe('DataTable');
  });
});

describe('toCamelCase', () => {
  it('converts PascalCase to camelCase', () => {
    expect(toCamelCase('MyComponent')).toBe('myComponent');
    expect(toCamelCase('DataTableRow')).toBe('dataTableRow');
  });

  it('converts kebab-case to camelCase', () => {
    expect(toCamelCase('my-component')).toBe('myComponent');
    expect(toCamelCase('data-table-row')).toBe('dataTableRow');
  });

  it('converts snake_case to camelCase', () => {
    expect(toCamelCase('my_component')).toBe('myComponent');
    expect(toCamelCase('data_table_row')).toBe('dataTableRow');
  });
});

describe('toKebabCase', () => {
  it('converts PascalCase to kebab-case', () => {
    expect(toKebabCase('MyComponent')).toBe('my-component');
    expect(toKebabCase('DataTableRow')).toBe('data-table-row');
  });

  it('converts camelCase to kebab-case', () => {
    expect(toKebabCase('myComponent')).toBe('my-component');
    expect(toKebabCase('dataTableRow')).toBe('data-table-row');
  });

  it('converts snake_case to kebab-case', () => {
    expect(toKebabCase('my_component')).toBe('my-component');
    expect(toKebabCase('data_table_row')).toBe('data-table-row');
  });
});

describe('toSnakeCase', () => {
  it('converts PascalCase to snake_case', () => {
    expect(toSnakeCase('MyComponent')).toBe('my_component');
    expect(toSnakeCase('DataTableRow')).toBe('data_table_row');
  });

  it('converts camelCase to snake_case', () => {
    expect(toSnakeCase('myComponent')).toBe('my_component');
    expect(toSnakeCase('dataTableRow')).toBe('data_table_row');
  });

  it('converts kebab-case to snake_case', () => {
    expect(toSnakeCase('my-component')).toBe('my_component');
    expect(toSnakeCase('data-table-row')).toBe('data_table_row');
  });
});

describe('normalizeHookName', () => {
  it('adds use prefix to base name', () => {
    expect(normalizeHookName('Debounce')).toBe('useDebounce');
    expect(normalizeHookName('LocalStorage')).toBe('useLocalStorage');
  });

  it('preserves use prefix if already present', () => {
    expect(normalizeHookName('useDebounce')).toBe('useDebounce');
    expect(normalizeHookName('useLocalStorage')).toBe('useLocalStorage');
  });

  it('normalizes case-insensitive use prefix', () => {
    expect(normalizeHookName('UseDebounce')).toBe('useDebounce');
    expect(normalizeHookName('USEDebounce')).toBe('useDebounce');
  });
});

describe('getContextNames', () => {
  it('generates all context naming variants', () => {
    const result = getContextNames('Theme');

    expect(result).toEqual({
      ContextName: 'ThemeContext',
      ProviderName: 'ThemeProvider',
      consumerHookName: 'useTheme',
      contextDisplayName: 'Theme',
      baseName: 'Theme',
    });
  });

  it('handles input with Context suffix', () => {
    const result = getContextNames('ThemeContext');

    expect(result.ContextName).toBe('ThemeContext');
    expect(result.ProviderName).toBe('ThemeProvider');
    expect(result.baseName).toBe('Theme');
  });

  it('handles input with Provider suffix', () => {
    const result = getContextNames('ThemeProvider');

    expect(result.ContextName).toBe('ThemeContext');
    expect(result.ProviderName).toBe('ThemeProvider');
    expect(result.baseName).toBe('Theme');
  });
});

describe('getComponentNames', () => {
  it('generates all component naming variants', () => {
    const result = getComponentNames('DataTable');

    expect(result).toEqual({
      ComponentName: 'DataTable',
      componentName: 'dataTable',
      'component-name': 'data-table',
    });
  });

  it('handles kebab-case input', () => {
    const result = getComponentNames('data-table');

    expect(result.ComponentName).toBe('DataTable');
    expect(result.componentName).toBe('dataTable');
    expect(result['component-name']).toBe('data-table');
  });
});

describe('getPageNames', () => {
  it('generates page names from simple path', () => {
    const result = getPageNames('dashboard');

    expect(result).toEqual({
      pageName: 'dashboard',
      PageName: 'Dashboard',
      pageTitle: 'Dashboard',
      pageDescription: 'Dashboard page',
      pagePath: 'dashboard',
    });
  });

  it('generates page names from nested path', () => {
    const result = getPageNames('dashboard/settings');

    expect(result.pageName).toBe('settings');
    expect(result.PageName).toBe('Settings');
    expect(result.pagePath).toBe('dashboard/settings');
  });

  it('handles multi-word page names', () => {
    const result = getPageNames('user-profile');

    expect(result.PageName).toBe('UserProfile');
    expect(result.pageTitle).toBe('User Profile');
  });
});
