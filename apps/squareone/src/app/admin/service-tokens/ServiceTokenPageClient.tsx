'use client';

import { Button } from '@lsst-sqre/squared';
import Link from 'next/link';
import React from 'react';

import { Lede } from '../../../components/Typography';
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
      <Lede>
        Service tokens provide machine access to the Rubin Science Platform.
      </Lede>
      <p>
        Unlike user access tokens, a service token is not tied to a specific
        user account; it represents a <code>bot-</code> identity used by an
        automated client or external service.
      </p>
      <p>
        Services deployed inside the RSP&rsquo;s Kubernetes environment should
        provision their tokens with a{' '}
        <a
          href="https://gafaelfawr.lsst.io/user-guide/service-tokens.html"
          target="_blank"
          rel="noreferrer"
        >
          GafaelfawrServiceToken resource
        </a>
        {'. '}
        Use this page to manage service tokens for cluster-external services or
        applications that generally aren't Kubernetes-aware.
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
