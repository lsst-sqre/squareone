import type { Metadata } from 'next';

import HomepageHero from '../components/HomepageHero';
import MainContent from '../components/MainContent';
import { getStaticConfig } from '../lib/config/rsc';
import PageShell from './PageShell';

/**
 * Generate metadata for the home page.
 * Uses the site name from configuration for the page title.
 */
export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();

  return {
    title: config.siteName,
    description: config.siteDescription,
    openGraph: {
      title: config.siteName,
      description: config.siteDescription,
    },
  };
}

/**
 * Home page using App Router.
 *
 * Displays the HomepageHero component with service cards for Portal,
 * Notebooks, and APIs.
 */
export default async function HomePage() {
  const config = await getStaticConfig();

  return (
    <PageShell config={config}>
      <MainContent>
        <HomepageHero />
      </MainContent>
    </PageShell>
  );
}
