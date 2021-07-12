import PropTypes from 'prop-types';
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
export default function BroadcastBanner({ broadcast }) {
  // If there isn't any broadcast content, don't show a banner
  if (!broadcast) {
    return <></>;
  }

  /* eslint-disable react/no-danger */
  return (
    <StyledBroadcastContainer>
      <aside dangerouslySetInnerHTML={{ __html: broadcast }} />
    </StyledBroadcastContainer>
  );
  /* eslint-enable react/no-danger */
}

BroadcastBanner.propTypes = {
  broadcast: PropTypes.string,
};
