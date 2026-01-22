import type { Metadata } from 'next';

import { getStaticConfig } from '../../../../../../../lib/config/rsc';
import GitHubPrNotebookClient from './GitHubPrNotebookClient';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Times Square | ${config.siteName}`,
  };
}

/**
 * GitHub PR notebook viewer page.
 *
 * Server component that renders metadata and delegates to the client
 * component for the interactive notebook viewer.
 */
export default function GitHubPrNotebookPage() {
  return <GitHubPrNotebookClient />;
}
