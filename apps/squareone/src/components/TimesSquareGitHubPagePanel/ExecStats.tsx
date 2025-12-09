/*
 * ExecStats provides a summary of the execution status and timing of the
 * notebook execution. It also provides a button to request the recomputation
 * of the already-executed notebook.
 * Updated to handle undefined context gracefully.
 */

import { Button } from '@lsst-sqre/squared';
import { formatDistanceToNow, parseISO } from 'date-fns';
import React from 'react';
import styled from 'styled-components';
import { TimesSquareHtmlEventsContext } from '../TimesSquareHtmlEventsProvider';

export default function ExecStats() {
  const htmlEvent = React.useContext(TimesSquareHtmlEventsContext);

  // Return null if context is not available yet
  if (!htmlEvent) {
    return null;
  }

  const handleRecompute = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();

    if (!htmlEvent.htmlUrl) {
      return;
    }

    await fetch(htmlEvent.htmlUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  if (htmlEvent.executionStatus === 'complete') {
    if (!htmlEvent.dateFinished) {
      return null;
    }

    const dateFinished = parseISO(htmlEvent.dateFinished);
    const formattedDuration = Number(htmlEvent.executionDuration).toFixed(1);
    return (
      <StyledContainer>
        <StyledContent>
          Computed{' '}
          <time
            dateTime={htmlEvent.dateFinished}
            title={htmlEvent.dateFinished}
          >
            {formatDistanceToNow(dateFinished, { addSuffix: true })}
          </time>{' '}
          in {formattedDuration} seconds.
        </StyledContent>
        <Button appearance="outline" tone="primary" onClick={handleRecompute}>
          Recompute
        </Button>
      </StyledContainer>
    );
  }

  if (htmlEvent.executionStatus === 'in_progress') {
    return (
      <StyledContainer>
        <p>Computing…</p>
      </StyledContainer>
    );
  }

  return null;
}

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 2rem;
`;

const StyledContent = styled.p`
  font-size: 0.8rem;
  margin-bottom: 0;
`;
