import PropTypes from 'prop-types';
import styled from 'styled-components';

import Header from './header';
import MainContent from './mainContent';
import Footer from './footer';
import Meta from './meta';
import BroadcastBanner from './broadcastBanner';
import { useFetch } from '../hooks/fetch';

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
    flex-shink: 0;
  }
`;

/*
 * Page wrapper component that provides the default layout of navigation,
 * content, and footer.
 */
export default function Page({ children, semaphoreUrl }) {
  const broadcastsUrl = semaphoreUrl ? `${semaphoreUrl}/v1/broadcasts` : null;
  const { data: broadcastData } = useFetch(broadcastsUrl);

  return (
    <StyledLayout>
      <Meta />
      <div className="upper-container">
        <Header />
        {broadcastData.map((broadcast) => (
          <BroadcastBanner broadcast={broadcast} key={broadcast.id} />
        ))}
        <MainContent>{children}</MainContent>
      </div>
      <div className="sticky-footer-container">
        <Footer />
      </div>
    </StyledLayout>
  );
}

Page.propTypes = {
  children: PropTypes.node,
  semaphoreUrl: PropTypes.string,
};
