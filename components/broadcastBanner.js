import PropTypes from 'prop-types';
import styled from 'styled-components';
import useDisclosure from 'react-a11y-disclosure';

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

  .disclosure {
    transition: 250ms;
  }

  .disclosure[aria-hidden='true'] {
    max-height: 0;
    opacity: 0;
    visibility: hidden;
  }

  a {
    color: white;
    text-decoration: underline;
  }

  a:hover {
    color: #dddddd;
  }
`;

/*
 * A broadcast message banner.
 */
export default function BroadcastBanner({ broadcast }) {
  const { toggleProps, contentProps, isExpanded } = useDisclosure({
    id: `broadcast-${broadcast.id}`,
    isExpanded: false,
  });

  // If there isn't any broadcast content, don't show a banner
  if (!broadcast) {
    return <></>;
  }

  /* eslint-disable react/no-danger */
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <StyledBroadcastContainer>
      <aside>
        <div dangerouslySetInnerHTML={{ __html: broadcast.summary.html }} />
        {broadcast.body && (
          <>
            <button type="button" {...toggleProps}>
              {isExpanded ? 'Show less' : 'Show more'}
            </button>

            <div className="disclosure" {...contentProps}>
              <div dangerouslySetInnerHTML={{ __html: broadcast.body.html }} />
            </div>
          </>
        )}
      </aside>
    </StyledBroadcastContainer>
  );
  /* eslint-enable react/no-danger */
  /* eslint-enable react/jsx-props-no-spreading */
}

BroadcastBanner.propTypes = {
  broadcast: PropTypes.object,
};
