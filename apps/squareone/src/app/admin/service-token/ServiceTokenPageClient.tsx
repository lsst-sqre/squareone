'use client';

import React from 'react';

/**
 * Client component for the `/admin/service-token` admin page.
 *
 * Renders the page heading, an introductory lede, and placeholder sections for
 * the two pieces of functionality the page will offer: creating a Gafaelfawr
 * service token for a `bot-` user, and looking up / revoking an existing bot
 * user's tokens. The placeholder sections are filled in by later tasks (the
 * creation form and the manage section); this slice establishes the route and
 * its layout so it appears in the admin sidebar and loads behind the
 * `exec:admin` gate inherited from the admin layout.
 */
export default function ServiceTokenPageClient() {
  return (
    <div>
      <h1>Service tokens</h1>
      <p>
        Create and manage Gafaelfawr service tokens for <code>bot-</code> users.
      </p>

      <section>
        <h2>Create a service token</h2>
        <p>The service-token creation form will appear here.</p>
      </section>

      <section>
        <h2>Manage existing tokens</h2>
        <p>
          Look up and revoke an existing bot user&rsquo;s service tokens here.
        </p>
      </section>
    </div>
  );
}
