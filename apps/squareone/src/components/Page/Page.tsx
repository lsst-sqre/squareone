import type { ReactNode } from 'react';
import React from 'react';
import styled from 'styled-components';
import { useAppConfig } from '../../contexts/AppConfigContext';
import BroadcastBannerStack from '../BroadcastBannerStack';
import Footer from '../Footer';
import Header from '../Header';
import Meta from '../Meta';

type PageProps = {
  children?: ReactNode;
};

/*
 * Layout wrapper div.
 *
 * Its main job is to provide a "sticky footer" so that the Footer component
 * stays at the bottom of the page and the Header/MainContent components
 * take up any excess space. See
 * https://css-tricks.com/couple-takes-sticky-footer/
 */
const StyledLayout = styled.div`
  /* Flexbox for the sticky footer */
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .upper-container {
    flex: 1 0 auto;
  }
  .sticky-footer-container {
    flex-shrink: 0;
  }
`;

/*
 * Page wrapper component that provides the default layout of navigation,
 * content, and footer.
 */
export default function Page({ children }: PageProps) {
  const config = useAppConfig();

  return (
    <StyledLayout>
      <Meta />
      <div className="upper-container">
        <Header />
        <BroadcastBannerStack semaphoreUrl={config.semaphoreUrl} />
        {children}
      </div>
      <div className="sticky-footer-container">
        <Footer />
      </div>
    </StyledLayout>
  );
}
