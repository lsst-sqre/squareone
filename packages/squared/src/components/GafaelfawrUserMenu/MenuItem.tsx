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
  padding: calc(var(--gafaelfawr-user-menu-padding) / 2)
    var(--gafaelfawr-user-menu-padding);
  margin: calc(var(--gafaelfawr-user-menu-padding) / -2);
  margin-bottom: calc(var(--gafaelfawr-user-menu-padding) / 2);
  &:last-of-type {
    margin-bottom: 0;
  }

  outline: none;

  &:focus {
    background-color: var(
      --rsd-component-header-nav-menulist-selected-background-color
    );
    color: white;

    a {
      color: white;
    }
  }
`;

export default MenuItem;
