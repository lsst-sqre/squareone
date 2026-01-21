import type { ReactNode } from 'react';

import { getStaticConfig } from '../../lib/config/rsc';
import SettingsLayoutClient from './SettingsLayoutClient';

type SettingsLayoutProps = {
  children: ReactNode;
};

/**
 * Settings section layout for App Router.
 *
 * This server component loads configuration and passes it to the
 * client component, ensuring config is fetched server-side rather
 * than client-side.
 */
export default async function SettingsLayout({
  children,
}: SettingsLayoutProps) {
  const config = await getStaticConfig();

  return (
    <SettingsLayoutClient config={config}>{children}</SettingsLayoutClient>
  );
}
