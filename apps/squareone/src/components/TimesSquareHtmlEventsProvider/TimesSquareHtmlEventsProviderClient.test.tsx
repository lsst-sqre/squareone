/*
 * Tests for TimesSquareHtmlEventsProviderClient.
 *
 * The SSE transport is owned by @lsst-sqre/times-square-client's
 * subscribeToHtmlEvents; these tests mock that package and verify the
 * provider wires the subscription lifecycle and context updates.
 */

import type { HtmlEvent } from '@lsst-sqre/times-square-client';
import {
  subscribeToHtmlEvents,
  useTimesSquarePage,
} from '@lsst-sqre/times-square-client';
import { act, render, screen } from '@testing-library/react';
import { type ContextType, useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import { TimesSquareHtmlEventsContext } from './TimesSquareHtmlEventsProvider';
import TimesSquareHtmlEventsProviderClient from './TimesSquareHtmlEventsProviderClient';

vi.mock('@lsst-sqre/times-square-client', () => ({
  subscribeToHtmlEvents: vi.fn(() => vi.fn()),
  useTimesSquarePage: vi.fn(() => ({ htmlEventsUrl: null })),
}));

vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: () => 'https://example.com/repertoire',
}));

const mockSubscribe = vi.mocked(subscribeToHtmlEvents);
const mockUseTimesSquarePage = vi.mocked(useTimesSquarePage);

const htmlEventsUrl =
  'https://example.com/times-square/api/v1/pages/mypage/html/events';

const completeEvent: HtmlEvent = {
  date_submitted: '2024-01-15T10:00:00Z',
  date_started: '2024-01-15T10:00:01Z',
  date_finished: '2024-01-15T10:00:15Z',
  execution_status: 'complete',
  execution_duration: 14.2,
  html_hash: 'abc123def456',
  html_url: 'https://example.com/times-square/api/v1/pages/mypage/html',
};

type UrlParametersValue = NonNullable<
  ContextType<typeof TimesSquareUrlParametersContext>
>;

function makeUrlParameters(urlQueryString = ''): UrlParametersValue {
  return {
    tsPageUrl: 'https://example.com/times-square/api/v1/github/owner/repo/nb',
    displaySettings: { ts_hide_code: '1' },
    notebookParameters: {},
    owner: null,
    repo: null,
    commit: null,
    tsSlug: ['owner', 'repo', 'nb'],
    githubSlug: 'owner/repo/nb',
    urlQueryString,
  };
}

function ContextProbe() {
  const context = useContext(TimesSquareHtmlEventsContext);
  return (
    <div>
      <span data-testid="executionStatus">
        {context?.executionStatus ?? 'null'}
      </span>
      <span data-testid="htmlHash">{context?.htmlHash ?? 'null'}</span>
      <span data-testid="htmlUrl">{context?.htmlUrl ?? 'null'}</span>
      <span data-testid="dateSubmitted">
        {context?.dateSubmitted ?? 'null'}
      </span>
    </div>
  );
}

function renderProvider(urlQueryString = '') {
  return render(
    <TimesSquareUrlParametersContext.Provider
      value={makeUrlParameters(urlQueryString)}
    >
      <TimesSquareHtmlEventsProviderClient>
        <ContextProbe />
      </TimesSquareHtmlEventsProviderClient>
    </TimesSquareUrlParametersContext.Provider>
  );
}

describe('TimesSquareHtmlEventsProviderClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSubscribe.mockReturnValue(vi.fn());
    mockUseTimesSquarePage.mockReturnValue({
      htmlEventsUrl,
      // biome-ignore lint/suspicious/noExplicitAny: only htmlEventsUrl is consumed by the provider
    } as any);
  });

  it('subscribes to HTML events with the events URL and URL query parameters', () => {
    renderProvider('a=1&ts_hide_code=1');

    expect(mockSubscribe).toHaveBeenCalledTimes(1);
    expect(mockSubscribe).toHaveBeenCalledWith(
      htmlEventsUrl,
      { a: '1', ts_hide_code: '1' },
      expect.objectContaining({ onEvent: expect.any(Function) })
    );
  });

  it('does not subscribe when the events URL is not available', () => {
    mockUseTimesSquarePage.mockReturnValue({
      htmlEventsUrl: null,
      // biome-ignore lint/suspicious/noExplicitAny: only htmlEventsUrl is consumed by the provider
    } as any);

    renderProvider();

    expect(mockSubscribe).not.toHaveBeenCalled();
  });

  it('updates context values when an HTML event is received', () => {
    renderProvider();

    expect(screen.getByTestId('executionStatus')).toHaveTextContent('null');

    const options = mockSubscribe.mock.calls[0][2];
    act(() => {
      options?.onEvent(completeEvent);
    });

    expect(screen.getByTestId('executionStatus')).toHaveTextContent('complete');
    expect(screen.getByTestId('htmlHash')).toHaveTextContent('abc123def456');
    expect(screen.getByTestId('htmlUrl')).toHaveTextContent(
      completeEvent.html_url
    );
    expect(screen.getByTestId('dateSubmitted')).toHaveTextContent(
      '2024-01-15T10:00:00Z'
    );
  });

  it('cleans up the subscription on unmount', () => {
    const cleanup = vi.fn();
    mockSubscribe.mockReturnValue(cleanup);

    const { unmount } = renderProvider();
    expect(cleanup).not.toHaveBeenCalled();

    unmount();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
