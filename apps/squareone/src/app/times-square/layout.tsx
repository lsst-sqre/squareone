import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { getStaticConfig } from '../../lib/config/rsc';
import TimesSquareLayoutClient from './TimesSquareLayoutClient';

type TimesSquareLayoutProps = {
  children: ReactNode;
};

/**
 * Times Square section layout for App Router.
 *
 * This server component checks if Times Square is configured and returns
 * a 404 if the service URL is not set. The client component handles the
 * provider hierarchy and layout wrapper.
 */
export default async function TimesSquareLayout({
  children,
}: TimesSquareLayoutProps) {
  const config = await getStaticConfig();

  // Return 404 if Times Square is not configured
  if (!config.timesSquareUrl) {
    notFound();
  }

  return <TimesSquareLayoutClient>{children}</TimesSquareLayoutClient>;
}
