import React from 'react';
/*
 * TimesSquareParameters with dynamic import to prevent SSR issues
 * Uses client-only component to handle SWR hooks safely.
 */

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled to prevent SWR hook issues
const TimesSquareParametersClient = dynamic(
  () => import('./TimesSquareParametersClient'),
  {
    ssr: false,
    loading: () => null, // No loading state needed for parameters form
  }
);

export default function TimesSquareParameters() {
  return <TimesSquareParametersClient />;
}
