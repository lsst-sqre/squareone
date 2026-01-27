import type { Metadata } from 'next';

import { getStaticConfig } from '../../../../../../lib/config/rsc';
import GitHubPrLandingClient from './GitHubPrLandingClient';

type GitHubPrLandingPageProps = {
  params: Promise<{
    owner: string;
    repo: string;
    commit: string;
  }>;
};

export async function generateMetadata({
  params,
}: GitHubPrLandingPageProps): Promise<Metadata> {
  const { owner, repo, commit } = await params;
  const config = await getStaticConfig();
  return {
    title: `Pull Request Preview ${owner}/${repo} ${commit} | ${config.siteName}`,
  };
}

/**
 * GitHub PR preview landing page.
 *
 * Server component that renders metadata and delegates to the client
 * component for the interactive PR preview content.
 */
export default function GitHubPrLandingPage() {
  return <GitHubPrLandingClient />;
}
