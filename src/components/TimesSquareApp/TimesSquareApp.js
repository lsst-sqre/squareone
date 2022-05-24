/*
 * TimesSquareApp provides the navigational controls for all Times Square
 * pages. The child of TimesSquareApp tends to be the content of the specific
 * page, usually the page viewer, or a markdown view of the GitHub repository.
 */

import styled from 'styled-components';

import Sidebar from './Sidebar';

const StyledLayout = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  height: 100%;

  // main content
  main {
    width: 100%;
  }
`;

export default function TimesSquareApp({ children, pagePath }) {
  console.log('Running TimesSquareApp');
  return (
    <StyledLayout>
      <Sidebar pagePath={pagePath} />
      <main>{children}</main>
    </StyledLayout>
  );
}
