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

// Next.js runtime config types
declare module 'next/config' {
  export interface PublicRuntimeConfig {
    sentryDsn?: string | null;
    [key: string]: any;
  }

  export interface ServerRuntimeConfig {
    sentryDsn?: string | null;
    [key: string]: any;
  }

  export interface NextConfig {
    publicRuntimeConfig?: PublicRuntimeConfig;
    serverRuntimeConfig?: ServerRuntimeConfig;
  }

  export default function getConfig(): NextConfig;
}
