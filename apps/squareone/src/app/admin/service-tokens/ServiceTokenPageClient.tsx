'use client';

import { Button } from '@lsst-sqre/squared';
import Link from 'next/link';
import React from 'react';

import ManageServiceTokens from './ManageServiceTokens';

/**
 * Client component for the `/admin/service-tokens` admin landing page.
 *
 * Mirrors the user-token landing (`/settings/tokens`): it presents an entry
 * point to the creation flow — a "Create a service token" button linking to
 * `/admin/service-tokens/new` — and the manage-existing-tokens section
 * ({@link ManageServiceTokens}) for looking up and revoking a bot user's service
 * tokens. The creation form itself (and its `admin:token` gate) lives on the
 * `/new` page, so this landing page needs no login info.
 *
 * The page sits behind the `exec:admin` gate inherited from the admin layout.
 */
export default function ServiceTokenPageClient() {
  return (
    <div>
      <h1>Service tokens</h1>
      <p>
        Create and manage Gafaelfawr service tokens for <code>bot-</code> users.
      </p>

      <Button as={Link} href="/admin/service-tokens/new">
        Create a service token
      </Button>

      <section>
        <h2>Manage existing tokens</h2>
        <ManageServiceTokens />
      </section>
    </div>
  );
}
