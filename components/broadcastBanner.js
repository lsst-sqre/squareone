import getConfig from 'next/config';
import styled from 'styled-components';

import { ContentMaxWidth } from '../styles/sizes';

const StyledBroadcastContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 0.5em;
  background-color: var(--rsd-color-red-500);
  color: white;

  aside {
    margin: 0 auto;
    max-width: ${ContentMaxWidth};
    padding: 0 var(--size-screen-padding-min);

    @media (min-width: ${ContentMaxWidth}) {
      padding: 0;
    }
  }
`;

/*
 * A broadcast message banner.
 */
export default function BroadcastBanner() {
  const { publicRuntimeConfig } = getConfig();

  // If there isn't any broadcast content, don't show a banner
  if (!('broadcastMarkdown' in publicRuntimeConfig)) {
    return <></>;
  }

  const { broadcastMarkdown } = publicRuntimeConfig;

  return (
    <StyledBroadcastContainer>
      <aside>{broadcastMarkdown}</aside>
    </StyledBroadcastContainer>
  );
}
