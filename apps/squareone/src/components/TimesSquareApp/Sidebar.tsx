/*
 * The navigational sidebar for Times Square.
 */

import { IconPill } from '@lsst-sqre/squared';
import Link from 'next/link';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { useAppConfig } from '../../contexts/AppConfigContext';
import { getDocsUrl } from '../../lib/utils/docsUrls';

type SidebarProps = {
  pageNav?: ReactNode;
  pagePanel?: ReactNode;
};

const StyledSidebar = styled.div`
  border-right: 1px solid var(--rsd-color-primary-600);
  padding: 0 var(--size-screen-padding-min) 2rem 0.5rem;
  width: 18rem;
`;

const AppTitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 1rem;
  margin-top: 0.67em;
  font-weight: bold;
  color: var(--rsd-component-text-headline-color);
  text-transform: uppercase;
`;

export default function Sidebar({ pageNav, pagePanel }: SidebarProps) {
  const { docsBaseUrl } = useAppConfig();
  const docsUrl = getDocsUrl(docsBaseUrl, '/guides/times-square/index.html');

  return (
    <StyledSidebar>
      <Link href="/times-square">
        <AppTitle>Times Square</AppTitle>
      </Link>
      <IconPill
        icon={['fas', 'book']}
        text="Documentation"
        url={docsUrl}
        textColor="#ffffff"
        backgroundColor="var(--rsd-color-primary-600)"
      />
      {pagePanel && pagePanel}
      {pageNav && pageNav}
    </StyledSidebar>
  );
}
