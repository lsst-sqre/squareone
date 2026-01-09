'use client';

import { ThemeProvider } from 'next-themes';
import type { ReactNode } from 'react';

type ProvidersProps = {
  children: ReactNode;
};

/**
 * Client-side providers for App Router.
 *
 * Contains providers that require client-side JavaScript:
 * - ThemeProvider for dark/light mode switching via next-themes
 *
 * This component is marked 'use client' to enable client-side functionality
 * while keeping the root layout as a server component.
 *
 * @example
 * ```tsx
 * // In layout.tsx
 * <Providers>
 *   {children}
 * </Providers>
 * ```
 */
export default function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" attribute="data-theme">
      {children}
    </ThemeProvider>
  );
}
