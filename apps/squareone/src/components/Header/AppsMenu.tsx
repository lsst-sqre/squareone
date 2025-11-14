import { PrimaryNavigation } from '@lsst-sqre/squared';
import { useRouter } from 'next/router';
import type React from 'react';
import { ChevronDown } from 'react-feather';
import { useAppConfig } from '../../contexts/AppConfigContext';

type AppLink = {
  href: string;
  label: string;
  internal?: boolean;
};

type LinkProps = {
  href: string;
  internal?: boolean;
  children: React.ReactNode;
};

export default function AppsMenu() {
  const { appLinks } = useAppConfig();

  return (
    <>
      <PrimaryNavigation.Trigger>
        Apps <ChevronDown />
      </PrimaryNavigation.Trigger>
      <PrimaryNavigation.Content>
        {appLinks.map((link, index) => (
          <PrimaryNavigation.ContentItem key={`${link.href}-${index}`}>
            <Link href={link.href} internal={link.internal}>
              {link.label}
            </Link>
          </PrimaryNavigation.ContentItem>
        ))}
      </PrimaryNavigation.Content>
    </>
  );
}

const Link = ({ href, internal, children }: LinkProps) => {
  const router = useRouter();
  const isActive = href === router.pathname;

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
