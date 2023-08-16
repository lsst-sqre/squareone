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
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin: -0.5rem;
  margin-bottom: 0.5rem;
  &:last-of-type {
    margin-bottom: 0;
  }

  outline: none;

  &:focus {
    background-color: var(
      --rsd-component-header-nav-menulist-selected-background-color
    );
    color: white;
  }

  a {
    color: inherit;
  }
  a:focus {
    color: white;
  }
`;

export default MenuItem;
