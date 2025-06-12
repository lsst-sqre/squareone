import PropTypes from 'prop-types';
import styled from 'styled-components';

import HeaderNav from './HeaderNav';
import PreHeader from './PreHeader';

const StyledHeader = styled.header`
  width: 100%;
  margin: 0;
  padding: 10px;

  background-color: var(--rsd-component-header-background-color);

  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: flex-end;
`;

/*
 * Site header, including logo, navigation, and log-in component.
 */
export default function Header() {
  return (
    <StyledHeader>
      <PreHeader />
      <HeaderNav />
    </StyledHeader>
  );
}

Header.propTypes = {};
