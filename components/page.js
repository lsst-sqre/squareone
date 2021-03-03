import PropTypes from 'prop-types';

import Header from './header';
import MainContent from './mainContent';
import Footer from './footer';

/*
 * Page wapper component that provides the default layout of navigation,
 * content, and footer.
 */
export default function Page({ children }) {
  return (
    <>
      <Header />
      <MainContent>{children}</MainContent>
      <Footer />
    </>
  );
}

Page.propTypes = {
  children: PropTypes.node,
};
