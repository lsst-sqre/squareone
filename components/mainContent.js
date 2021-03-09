import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledMain = styled.main`
  margin: 0 auto;
  max-width: 60em;
  padding: 0 10px 0 10px;
`;

/*
 * Main content wrapper (contained within a Page component).
 */
export default function MainContent({ children }) {
  return <StyledMain>{children}</StyledMain>;
}

MainContent.propTypes = {
  children: PropTypes.node,
};
