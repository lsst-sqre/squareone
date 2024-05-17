import React from 'react';
import styled from 'styled-components';

import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

export const Separator = styled(RadixDropdownMenu.Separator)`
  margin: 0.5rem calc(var(--gafaelfawr-user-menu-padding) * -1) 0.5rem;
  border: 1px solid var(--rsd-color-primary-700);
`;

export default Separator;
