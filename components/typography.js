import styled from 'styled-components';

export const Lede = styled.p`
  font-size: 1.3rem;
  margin-bottom: 2rem;
`;

export const CtaLink = styled.a`
  display: inline-block;
  font-size: 1.3rem;
  padding: 1rem;
  border-radius: 0.5rem;
  --tw-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --tw-ring-offset-shadow: 0 0 transparent;
  --tw-ring-shadow: 0 0 transparent;
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  border: solid 1px transparent;
  background-color: var(--sqo-doc-card-background-color);

  &:hover {
    border: solid 1px var(--rsd-color-primary-600);
  }
`;
