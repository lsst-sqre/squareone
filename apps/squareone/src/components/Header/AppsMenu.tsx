'use client';

import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';
import { PrimaryNavigation } from '@lsst-sqre/squared';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { makeReportError } from '@/lib/sentry/reportError';
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { useStaticConfig } from '../../hooks/useStaticConfig';
import { deriveAppsMenuItems } from './appsMenuItems';

type AppsMenuProps = {
  /** Class name for the menu's navigation item. */
  className?: string;
};

type LinkProps = {
  href: string;
  internal?: boolean;
  children: ReactNode;
};

/*
 * The header's Apps menu: a navigation item (trigger and dropdown) listing the
 * items deriveAppsMenuItems derives from service discovery, the user's scopes,
 * and the configured `appLinks`. Renders nothing when there are no items.
 *
 * Without service discovery (no `repertoireUrl`) the menu lists the configured
 * `appLinks` only.
 */
export default function AppsMenu({ className }: AppsMenuProps) {
  const { appLinks } = useStaticConfig();
  const repertoireUrl = useRepertoireUrl();
  const { query } = useServiceDiscovery(repertoireUrl ?? '');

  // Pass the same Sentry reporter as UserMenu so this login-info observer
  // doesn't swallow report-worthy failures.
  const reportError = useMemo(() => makeReportError({ isServer: false }), []);
  const userScopes = useLoginInfo(repertoireUrl, {
    reportError,
    context: { site: 'login-info', package: 'gafaelfawr-client' },
  }).query?.scopes;

  const items = deriveAppsMenuItems({
    query,
    userScopes,
    appLinks,
    timesSquareEnabled: query?.hasApplication('times-square') ?? false,
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <PrimaryNavigation.Item className={className}>
      <PrimaryNavigation.Trigger>
        {/* Decorative disclosure indicator; the trigger already reads "Apps". */}
        Apps <ChevronDown aria-hidden="true" />
      </PrimaryNavigation.Trigger>
      <PrimaryNavigation.Content>
        {items.map((item) => (
          <PrimaryNavigation.ContentItem key={item.href}>
            <Link href={item.href} internal={item.internal}>
              {item.label}
            </Link>
          </PrimaryNavigation.ContentItem>
        ))}
      </PrimaryNavigation.Content>
    </PrimaryNavigation.Item>
  );
}

const Link = ({ href, internal, children }: LinkProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = href === pathname;

  // For internal links, we need to handle navigation without breaking
  // keyboard focus. We use PrimaryNavigation.Link with onClick handler
  // directly instead of nesting a span which breaks focus management.
  if (internal) {
    return (
      <PrimaryNavigation.Link
        active={isActive}
        onClick={(e) => {
          e.preventDefault();
          router.push(href);
        }}
        href={href}
      >
        {children}
      </PrimaryNavigation.Link>
    );
  }

  // External links are handled by the PrimaryNavigation.Link component, which
  // becomes an <a> tag without any Next onClick handlers.
  return (
    <PrimaryNavigation.Link active={isActive} href={href}>
      {children}
    </PrimaryNavigation.Link>
  );
};
