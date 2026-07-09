import { render, screen } from '@testing-library/react';
import { useContext } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import TimesSquareUrlParametersProvider, {
  TimesSquareUrlParametersContext,
} from './TimesSquareUrlParametersProvider';

let mockPathname = '/times-square/github/lsst-sqre/demo/notebook';
let mockSearchParams = new URLSearchParams();
const mockParams: Record<string, string | string[]> = {
  tsSlug: ['lsst-sqre', 'demo', 'notebook'],
};

vi.mock('next/navigation', () => ({
  useParams: () => mockParams,
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

vi.mock('../../hooks/useStaticConfig', () => ({
  useStaticConfig: () => ({
    timesSquareUrl: 'https://example.com/times-square/api',
  }),
}));

function ContextProbe() {
  const context = useContext(TimesSquareUrlParametersContext);
  return (
    <>
      <div data-testid="notebook-parameters">
        {JSON.stringify(context?.notebookParameters)}
      </div>
      <div data-testid="display-settings">
        {JSON.stringify(context?.displaySettings)}
      </div>
    </>
  );
}

function renderProbe() {
  render(
    <TimesSquareUrlParametersProvider>
      <ContextProbe />
    </TimesSquareUrlParametersProvider>
  );
  return {
    notebookParameters: JSON.parse(
      screen.getByTestId('notebook-parameters').textContent ?? 'null'
    ),
    displaySettings: JSON.parse(
      screen.getByTestId('display-settings').textContent ?? 'null'
    ),
  };
}

beforeEach(() => {
  mockPathname = '/times-square/github/lsst-sqre/demo/notebook';
  mockSearchParams = new URLSearchParams();
});

describe('TimesSquareUrlParametersProvider reserved ts_ parameters', () => {
  it('excludes ts_nav_focus from notebook parameters', () => {
    mockSearchParams = new URLSearchParams({
      ts_nav_focus: 'lsst-sqre/demo',
      myparam: '42',
    });
    const { notebookParameters } = renderProbe();
    expect(notebookParameters).toEqual({ myparam: '42' });
  });

  it('excludes ts_hide_code from notebook parameters and keeps it as a display setting', () => {
    mockSearchParams = new URLSearchParams({
      ts_hide_code: '0',
      myparam: '42',
    });
    const { notebookParameters, displaySettings } = renderProbe();
    expect(notebookParameters).toEqual({ myparam: '42' });
    expect(displaySettings).toEqual({ ts_hide_code: '0' });
  });

  it('defaults ts_hide_code to "1" when absent', () => {
    const { displaySettings } = renderProbe();
    expect(displaySettings).toEqual({ ts_hide_code: '1' });
  });

  it('passes non-reserved parameters through as notebook parameters', () => {
    mockSearchParams = new URLSearchParams({ a: '1', b: 'two' });
    const { notebookParameters } = renderProbe();
    expect(notebookParameters).toEqual({ a: '1', b: 'two' });
  });
});
