import styled from 'styled-components';
import useDisclosure from 'react-a11y-disclosure';

import { ContentMaxWidth } from '../../styles/sizes';

type BroadcastCategory = 'info' | 'outage' | 'notice' | 'maintenance' | 'other';

type BroadcastContent = {
  gfm: string;
  html: string;
};

type Broadcast = {
  id: string;
  summary: BroadcastContent;
  body?: BroadcastContent;
  active: boolean;
  enabled: boolean;
  stale: boolean;
  category: BroadcastCategory;
};

type BroadcastBannerProps = {
  broadcast?: Broadcast;
};

const StyledBroadcastContainer = styled.div<{ $category: BroadcastCategory }>`
  width: 100%;
  margin: 0;
  padding: 0.5em;
  background-color: ${(props) => {
    if (props.$category === 'info') return 'var(--rsd-color-primary-600)';
    if (props.$category === 'outage') return 'var(--rsd-color-red-500)';
    if (props.$category === 'notice' || props.$category === 'maintenance')
      return 'var(--rsd-color-orange-500)';
    return 'var(--rsd-color-gray-500)'; // default fallback
  }};
  color: white;

  aside {
    margin: 0.5rem auto;
    max-width: ${ContentMaxWidth};
    padding: 0 var(--size-screen-padding-min);

    @media (min-width: ${ContentMaxWidth}) {
      padding: 0;
    }
  }

  .summary {
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
  }

  .summary p {
    margin: 0;
  }

  .disclosure-button-area {
    margin-left: 1.5rem;
    align-self: flex-end;
  }

  .disclosure-button-area button {
    font-size: 0.8rem;
    cursor: pointer;
    background-color: transparent;
    color: white;
    border: 1px solid white;
    border-radius: 5px;
    transition: 250ms;
  }

  .disclosure-button-area button:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .disclosure {
    transition: 250ms;
    margin-top: 0.5em;
    max-height: 15em;
    overflow-y: auto;
    padding-right: 0.5em;
  }

  .disclosure[aria-hidden='true'] {
    height: 0;
    max-height: 0;
    opacity: 0;
    margin-top: 0;
    padding-top: 0;
    padding-bottom: 0;
    visibility: hidden;
    background-color: transparent;
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
export default function BroadcastBanner({ broadcast }: BroadcastBannerProps) {
  const { toggleProps, contentProps, isExpanded } = useDisclosure({
    id: `broadcast-${broadcast?.id}`,
    isExpanded: false,
  });

  // If there isn't any broadcast content, don't show a banner
  if (!broadcast) {
    return <></>;
  }

  /* eslint-disable react/no-danger */
  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <StyledBroadcastContainer $category={broadcast.category || 'other'}>
      <aside>
        <div className="summary">
          <div
            className="summary-content"
            dangerouslySetInnerHTML={{ __html: broadcast.summary.html }}
          />
          {broadcast.body && (
            <div className="disclosure-button-area">
              <button type="button" {...toggleProps}>
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            </div>
          )}
        </div>
        {broadcast.body && (
          <div className="disclosure" {...contentProps}>
            <div dangerouslySetInnerHTML={{ __html: broadcast.body.html }} />
          </div>
        )}
      </aside>
    </StyledBroadcastContainer>
  );
  /* eslint-enable react/no-danger */
  /* eslint-enable react/jsx-props-no-spreading */
}
