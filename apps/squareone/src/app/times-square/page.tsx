import type { Metadata } from 'next';

import { getStaticConfig } from '../../lib/config/rsc';
import TimesSquareHomeContent from './TimesSquareHomeContent';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Times Square | ${config.siteName}`,
  };
}

/**
 * Times Square home page.
 *
 * Server component that renders metadata and delegates to the client
 * component for the interactive content.
 */
export default function TimesSquarePage() {
  return <TimesSquareHomeContent />;
}
