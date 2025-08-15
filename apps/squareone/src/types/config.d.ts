// TypeScript declarations for YAML config modules

declare module '*.yaml' {
  const content: Record<string, any>;
  export default content;
}

declare module '*.yml' {
  const content: Record<string, any>;
  export default content;
}

// Declaration for js-yaml
declare module 'js-yaml' {
  export function load(str: string, options?: any): any;
  export function dump(obj: any, options?: any): string;
}
