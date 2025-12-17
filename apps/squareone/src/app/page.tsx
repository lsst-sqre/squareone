import type { Metadata } from 'next';

import HomepageHero from '../components/HomepageHero';
import MainContent from '../components/MainContent';
import { getStaticConfig } from '../lib/config/rsc';

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
 *
 * The page shell (Header, Footer) is provided by the root layout.
 */
export default function HomePage() {
  return (
    <MainContent>
      <HomepageHero />
    </MainContent>
  );
}
