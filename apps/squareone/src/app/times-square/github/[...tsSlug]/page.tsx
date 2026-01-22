import type { Metadata } from 'next';

import { getStaticConfig } from '../../../../lib/config/rsc';
import GitHubNotebookViewerClient from './GitHubNotebookViewerClient';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Times Square | ${config.siteName}`,
  };
}

/**
 * GitHub notebook viewer page.
 *
 * Server component that renders metadata and delegates to the client
 * component for the interactive notebook viewer.
 */
export default function GitHubNotebookPage() {
  return <GitHubNotebookViewerClient />;
}
