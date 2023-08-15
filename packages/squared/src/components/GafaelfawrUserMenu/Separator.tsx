import React from 'react';
import styled from 'styled-components';

import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu';

export const Separator = styled(RadixDropdownMenu.Separator)`
  margin: 1rem -1rem;
  margin: 0 -1rem 1rem;
  border: 1px solid var(--rsd-color-primary-700);
`;

export default Separator;
