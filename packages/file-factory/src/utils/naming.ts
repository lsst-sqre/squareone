/**
 * Naming utilities for converting between different case styles
 */

/**
 * Convert a string to PascalCase
 *
 * @example
 * toPascalCase('my-component') // 'MyComponent'
 * toPascalCase('myComponent') // 'MyComponent'
 * toPascalCase('my_component') // 'MyComponent'
 */
export function toPascalCase(str: string): string {
  // Handle already PascalCase strings
  if (/^[A-Z][a-zA-Z0-9]*$/.test(str)) {
    return str;
  }

  return (
    str
      // Split on hyphens, underscores, or camelCase boundaries
      .split(/[-_]|(?=[A-Z])/)
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('')
  );
}

/**
 * Convert a string to camelCase
 *
 * @example
 * toCamelCase('MyComponent') // 'myComponent'
 * toCamelCase('my-component') // 'myComponent'
 * toCamelCase('my_component') // 'myComponent'
 */
export function toCamelCase(str: string): string {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert a string to kebab-case
 *
 * @example
 * toKebabCase('MyComponent') // 'my-component'
 * toKebabCase('myComponent') // 'my-component'
 * toKebabCase('my_component') // 'my-component'
 */
export function toKebabCase(str: string): string {
  return (
    str
      // Insert hyphen before uppercase letters (for PascalCase/camelCase)
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      // Replace underscores with hyphens
      .replace(/_/g, '-')
      // Convert to lowercase
      .toLowerCase()
  );
}

/**
 * Convert a string to snake_case
 *
 * @example
 * toSnakeCase('MyComponent') // 'my_component'
 * toSnakeCase('myComponent') // 'my_component'
 * toSnakeCase('my-component') // 'my_component'
 */
export function toSnakeCase(str: string): string {
  return (
    str
      // Insert underscore before uppercase letters
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      // Replace hyphens with underscores
      .replace(/-/g, '_')
      // Convert to lowercase
      .toLowerCase()
  );
}

/**
 * Ensure a hook name starts with "use"
 *
 * @example
 * normalizeHookName('Debounce') // 'useDebounce'
 * normalizeHookName('useDebounce') // 'useDebounce'
 * normalizeHookName('UseDebounce') // 'useDebounce'
 */
export function normalizeHookName(name: string): string {
  // Remove existing 'use' prefix (case-insensitive)
  const baseName = name.replace(/^use/i, '');
  // Ensure proper casing
  const pascalBase = toPascalCase(baseName);
  return `use${pascalBase}`;
}

/**
 * Get context-related names from a base context name
 *
 * @example
 * getContextNames('Theme')
 * // {
 * //   ContextName: 'ThemeContext',
 * //   ProviderName: 'ThemeProvider',
 * //   consumerHookName: 'useTheme',
 * //   contextDisplayName: 'Theme',
 * //   baseName: 'Theme'
 * // }
 *
 * getContextNames('ThemeContext')
 * // Same as above - removes 'Context' suffix before processing
 */
export function getContextNames(name: string): {
  ContextName: string;
  ProviderName: string;
  consumerHookName: string;
  contextDisplayName: string;
  baseName: string;
} {
  // Remove 'Context' or 'Provider' suffix if present
  let baseName = name.replace(/Context$/i, '').replace(/Provider$/i, '');

  baseName = toPascalCase(baseName);

  return {
    ContextName: `${baseName}Context`,
    ProviderName: `${baseName}Provider`,
    consumerHookName: `use${baseName}`,
    contextDisplayName: baseName,
    baseName,
  };
}

/**
 * Get component-related names
 *
 * @example
 * getComponentNames('data-table')
 * // {
 * //   ComponentName: 'DataTable',
 * //   componentName: 'dataTable',
 * //   'component-name': 'data-table'
 * // }
 */
export function getComponentNames(name: string): {
  ComponentName: string;
  componentName: string;
  'component-name': string;
} {
  const ComponentName = toPascalCase(name);
  const componentName = toCamelCase(name);
  const kebabName = toKebabCase(name);

  return {
    ComponentName,
    componentName,
    'component-name': kebabName,
  };
}

/**
 * Get page-related names from a page path
 *
 * @example
 * getPageNames('dashboard/settings')
 * // {
 * //   pageName: 'settings',
 * //   PageName: 'Settings',
 * //   pageTitle: 'Settings',
 * //   pageDescription: 'Settings page',
 * //   pagePath: 'dashboard/settings'
 * // }
 */
export function getPageNames(pagePath: string): {
  pageName: string;
  PageName: string;
  pageTitle: string;
  pageDescription: string;
  pagePath: string;
} {
  // Get the last segment of the path
  const segments = pagePath.split('/').filter(Boolean);
  const pageName = segments[segments.length - 1] || 'index';
  const PageName = toPascalCase(pageName);
  const pageTitle = PageName
    // Add spaces before capital letters
    .replace(/([A-Z])/g, ' $1')
    .trim();

  return {
    pageName,
    PageName,
    pageTitle,
    pageDescription: `${pageTitle} page`,
    pagePath,
  };
}
