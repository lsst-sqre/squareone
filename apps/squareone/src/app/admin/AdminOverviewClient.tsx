'use client';

import AdminOverview from '../../components/AdminOverview';
import AdminDiscoveryGate from './AdminDiscoveryGate';

/**
 * Client container for the `/admin` environment overview.
 *
 * {@link AdminDiscoveryGate} reads Repertoire service discovery and handles
 * the not-configured, loading, and error states; once discovery has loaded,
 * the presentational {@link AdminOverview} renders the overview from it.
 *
 * The page sits behind the admin layout's any-admin `AdminRequired` gate and
 * needs no page scope of its own. Should a section need the viewer's scopes,
 * they come from `useUserScopes`.
 */
export default function AdminOverviewClient() {
  return (
    <AdminDiscoveryGate title="Overview" subject="overview">
      {({ discovery }) => <AdminOverview discovery={discovery} />}
    </AdminDiscoveryGate>
  );
}
