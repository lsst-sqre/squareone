/*
 * TimesSquareApp provides the navigational controls for all Times Square
 * pages. The child of TimesSquareApp tends to be the content of the specific
 * page, usually the page viewer, or a markdown view of the GitHub repository.
 */

import styled from 'styled-components';

import Sidebar from './Sidebar';

const StyledLayout = styled.div`
  display: grid;
  grid-template-columns: 18rem 1fr;
  grid-template-rows: 1fr;
  column-gap: 2rem;

  // main content
  main {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
  }

  // sidebar
  .ts-sidebar {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }
`;

export default function TimesSquareApp({ children }) {
  console.log('Running TimesSquareApp');
  return (
    <StyledLayout>
      <Sidebar />
      <main>{children}</main>
    </StyledLayout>
  );
}
