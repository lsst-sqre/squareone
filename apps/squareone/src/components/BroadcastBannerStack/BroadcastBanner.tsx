import { Button } from '@lsst-sqre/squared';
import React from 'react';
import useDisclosure from 'react-a11y-disclosure';
import styled from 'styled-components';
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
    align-items: baseline;
  }

  .summary p {
    margin: 0;
  }

  .disclosure-button-area {
    margin-left: 1.5rem;
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
    return null;
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
              <Button
                type="button"
                appearance="outline"
                tone="tertiary"
                size="sm"
                {...toggleProps}
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
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
