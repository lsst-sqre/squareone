import PropTypes from 'prop-types';

/*
 * Main content wrapper (contained within a Page component).
 */
export default function MainContent({ children }) {
  return <main>{children}</main>;
}

MainContent.propTypes = {
  children: PropTypes.node,
};
