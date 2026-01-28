import type { Metadata } from 'next';
import MainContent from '../../components/MainContent';
import { getStaticConfig } from '../../lib/config/rsc';

const pageDescription =
  'Learn about the Rubin Science Platform Acceptable Use Policy';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getStaticConfig();
  return {
    title: `Acceptable Use Policy | ${config.siteName}`,
    description: pageDescription,
    openGraph: {
      title: 'Acceptable Use Policy',
      description: pageDescription,
    },
  };
}

export default function TermsPage() {
  return (
    <MainContent>
      <h1>Acceptable Use Policy</h1>

      <p>
        We're giving you access to Rubin Observatory systems so you can do
        science with our data products or otherwise further the mission of the
        Observatory.
      </p>
      <p>
        You can lose your access (even if you have "data rights" to our data
        products) if you misuse our resources, interfere with other users, or
        otherwise do anything that would bring the Observatory into disrepute.
      </p>
      <p>Observatory systems staff have access to all your activity.</p>
    </MainContent>
  );
}
