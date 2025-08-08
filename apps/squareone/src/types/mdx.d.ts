// TypeScript declarations for MDX modules

declare module '*.mdx' {
  import { ComponentType } from 'react';
  const component: ComponentType<any>;
  export default component;
}

declare module '@mdx-js/react' {
  import { ComponentType, ReactNode } from 'react';

  export interface MDXProviderProps {
    components?: Record<string, ComponentType<any>>;
    children: ReactNode;
  }

  export const MDXProvider: ComponentType<MDXProviderProps>;
}
