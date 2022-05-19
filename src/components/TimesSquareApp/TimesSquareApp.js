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

  // grid-template-columns: 18rem 1fr;
  // grid-template-rows: 1fr;
  // column-gap: 2rem;

  // main content
  main {
    width: calc(100% - 25rem);
  }

  // sidebar
  .ts-sidebar {
    width: 25rem;
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
