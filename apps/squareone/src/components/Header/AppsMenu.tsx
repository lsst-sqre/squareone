'use client';

import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';
import { PrimaryNavigation } from '@lsst-sqre/squared';
import { ChevronDown } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useLoginInfo } from '../../hooks/useLoginInfo';
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
 *
 * The scope-gated discovery items need the user's scopes to be known. The root
 * layout prefetches login info alongside service discovery on the server and
 * hydrates both, so those items (and the menu itself, when they are all it
 * lists) are present on the first client render rather than popping in once
 * the browser's own login-info request resolves.
 */
export default function AppsMenu({ className }: AppsMenuProps) {
  const { appLinks, baseUrl } = useStaticConfig();
  const repertoireUrl = useRepertoireUrl();
  const { query } = useServiceDiscovery(repertoireUrl ?? '');

  const userScopes = useLoginInfo().query?.scopes;

  const items = deriveAppsMenuItems({
    query,
    userScopes,
    appLinks,
    timesSquareEnabled: query?.hasApplication('times-square') ?? false,
    baseUrl,
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
