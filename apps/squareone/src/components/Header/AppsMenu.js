import NextLink from 'next/link';
import { useRouter } from 'next/router';
import getConfig from 'next/config';
import styled from 'styled-components';

import { ChevronDown } from 'react-feather';
import { PrimaryNavigation } from '@lsst-sqre/squared';

export default function AppsMenu({}) {
  const { publicRuntimeConfig } = getConfig();
  const appLinks = publicRuntimeConfig.appLinks || [];

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

const Link = ({ href, ...props }) => {
  const router = useRouter();
  const isActive = href === router.pathname;

  // We're implementing our own Link component with an onClick handler because
  // if we compose Next.js's Link component we find that Radix Navigation Menu's
  // Link component is adding an onClick handler to the Next link that
  // causes an error of the sort:
  //   "onClick" was passed to <Link> with href of /docs but "legacyBehavior"
  //   was set.
  // However, this current implementation is not ideal because it doesn't
  // pass through the NavigationMenu's keyboard navigation.
  return (
    <PrimaryNavigation.Link active={isActive}>
      <span onClick={() => router.push(href)}>{props.children}</span>
    </PrimaryNavigation.Link>
  );
};
