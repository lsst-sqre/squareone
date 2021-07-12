import PropTypes from 'prop-types';
import styled from 'styled-components';

import Header from './header';
import MainContent from './mainContent';
import Footer from './footer';
import Meta from './meta';
import BroadcastBanner from './broadcastBanner';

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
 * Page wapper component that provides the default layout of navigation,
 * content, and footer.
 */
export default function Page({ children, loginData, broadcast }) {
  return (
    <StyledLayout>
      <Meta />
      <div className="upper-container">
        <Header loginData={loginData} />
        <BroadcastBanner broadcast={broadcast} />
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
  loginData: PropTypes.object.isRequired,
  broadcast: PropTypes.string,
};
