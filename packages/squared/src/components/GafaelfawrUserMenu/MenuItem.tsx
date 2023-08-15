import React from 'react';
import styled from 'styled-components';

import { DropdownMenuItem } from '@radix-ui/react-dropdown-menu';

export const MenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem>
>((props, forwardedRef) => (
  <StyledDropdownMenuItem {...props} ref={forwardedRef}>
    {props.children}
  </StyledDropdownMenuItem>
));
MenuItem.displayName = 'MenuItem';

const StyledDropdownMenuItem = styled(DropdownMenuItem)`
  color: var(--rsd-component-header-nav-menulist-text-color);
  border: 1px solid transparent;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin: -0.5rem;
  margin-bottom: 0.5rem;
  &:last-of-type {
    margin-bottom: 0;
  }

  outline: none;

  &:focus {
    background-color: var(--rsd-color-primary-500);
    color: white;
    border-color: var(--rsd-color-primary-600);
  }

  a {
    color: inherit;
  }
  a:focus {
    color: inherit;
  }
`;

export default MenuItem;
