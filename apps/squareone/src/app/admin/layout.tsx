import type { ReactNode } from 'react';

import { getStaticConfig } from '../../lib/config/rsc';
import AdminLayoutClient from './AdminLayoutClient';

type AdminLayoutProps = {
  children: ReactNode;
};

/**
 * Admin section layout for App Router.
 *
 * This server component loads configuration and passes it to the client
 * component, ensuring config is fetched server-side rather than client-side.
 * Mirrors the `/settings` layout pattern.
 */
export default async function AdminLayout({ children }: AdminLayoutProps) {
  const config = await getStaticConfig();

  return <AdminLayoutClient config={config}>{children}</AdminLayoutClient>;
}
