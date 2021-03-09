import styled from 'styled-components';

const StyledFooter = styled.footer`
  margin: 0 auto;
  max-width: 60em;
  padding: 0 10px 0 10px;
`;

/*
 * Footer component (contained within a Page component).
 */
export default function Footer() {
  return (
    <StyledFooter>
      <p>Footer</p>
    </StyledFooter>
  );
}
