/**
 * Build the Sentry project dashboard URL from the configured organization and
 * project slugs.
 *
 * Uses the modern Sentry SaaS org-subdomain form
 * (`https://<org>.sentry.io/projects/<project>/`). Both slugs are URL-encoded
 * so reserved characters can't break out of the path.
 *
 * @param org - Sentry organization slug (e.g. `rubin-observatory`).
 * @param project - Sentry project slug (e.g. `squareone`).
 * @returns The absolute URL of the project's Sentry dashboard.
 */
export function getSentryDashboardUrl(org: string, project: string): string {
  return `https://${encodeURIComponent(org)}.sentry.io/projects/${encodeURIComponent(project)}/`;
}
