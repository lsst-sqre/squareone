'use client';

import type { ReactNode } from 'react';
import { Suspense } from 'react';
import TimesSquareUrlParametersProviderAppRouter from '../../components/TimesSquareUrlParametersProvider/TimesSquareUrlParametersProviderAppRouter';
import WideContentLayout from '../../components/WideContentLayout';

type TimesSquareLayoutClientProps = {
  children: ReactNode;
};

/**
 * Client-side layout wrapper for Times Square pages.
 *
 * Provides:
 * - WideContentLayout for the full-width Times Square UI
 * - TimesSquareUrlParametersProviderAppRouter for URL state management
 * - Suspense boundary required by useSearchParams() in the provider
 */
export default function TimesSquareLayoutClient({
  children,
}: TimesSquareLayoutClientProps) {
  return (
    <WideContentLayout>
      <Suspense fallback={null}>
        <TimesSquareUrlParametersProviderAppRouter>
          {children}
        </TimesSquareUrlParametersProviderAppRouter>
      </Suspense>
    </WideContentLayout>
  );
}
