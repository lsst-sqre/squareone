import styled from 'styled-components';

const Button = styled.button`
  background-color: var(--sqo-primary-button-background-color);
  color: #ffffff;
  padding: var(--sqo-space-xxxs) var(--sqo-space-unit);
  border-radius: var(--sqo-border-radius-1);
  border: 1px solid transparent;
  transition: var(--sqo-transition-basic);
  box-shadow: var(--sqo-elevation-md);
  cursor: pointer;
  &:hover {
    box-shadow: var(--sqo-elevation-lg);
    background-color: var(--sqo-primary-button-background-color-hover);
  }
  &:active {
    background-color: var(--sqo-primary-button-background-color-active);
  }
`;

export default Button;

export const GhostButton = styled.button`
  --ghost-button-color: var(--sqo-primary-button-background-color);
  cursor: pointer;
  background: transparent;
  padding: var(--sqo-space-xxxs) var(--sqo-space-unit);
  border-radius: var(--sqo-border-radius-1);
  border: 1px solid var(--ghost-button-color);

  &:hover {
    background-color: var(--ghost-button-color);
    color: #fff;
  }
`;

export const RedGhostButton = styled(GhostButton)`
  --ghost-button-color: var(--rsd-color-red-500);

  &:disabled {
    // instead of setting opacity it'd be better to have a lighter red color
    opacity: 0.5;
    cursor: not-allowed;
    background-color: transparent;
    color: #000;
  }
`;
