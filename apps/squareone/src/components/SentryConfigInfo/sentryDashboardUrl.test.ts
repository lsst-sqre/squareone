import { describe, expect, it } from 'vitest';

import { getSentryDashboardUrl } from './sentryDashboardUrl';

describe('getSentryDashboardUrl', () => {
  it('builds the project dashboard URL from the org and project slugs', () => {
    expect(getSentryDashboardUrl('rubin-observatory', 'squareone')).toBe(
      'https://rubin-observatory.sentry.io/projects/squareone/'
    );
  });

  it('URL-encodes org and project slugs with reserved characters', () => {
    expect(getSentryDashboardUrl('my org', 'my/project')).toBe(
      'https://my%20org.sentry.io/projects/my%2Fproject/'
    );
  });
});
