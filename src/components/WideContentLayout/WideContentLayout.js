import PropTypes from 'prop-types';
import styled from 'styled-components';

const StyledContainer = styled.div`
  margin: 0 auto 0 0;
  // padding: 0 var(--size-screen-padding-min);
`;

/*
 * A <main> content layout wrapper that provides a wide layout for apps like
 * Times Square.
 */
export default function WideContentLayout({ children }) {
  return <StyledContainer>{children}</StyledContainer>;
}

WideContentLayout.propTypes = {
  children: PropTypes.node,
};
