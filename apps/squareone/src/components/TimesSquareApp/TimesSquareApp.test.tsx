import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import TimesSquareApp from './TimesSquareApp';

// The sidebar pulls in config/data-fetching hooks that are irrelevant to the
// landmark structure under test, so stub it out.
vi.mock('./Sidebar', () => ({
  default: () => <div>sidebar</div>,
}));

const contextValue = {
  tsPageUrl: '',
  displaySettings: { ts_hide_code: '1' },
  notebookParameters: {},
  owner: null,
  repo: null,
  commit: null,
  tsSlug: null,
  githubSlug: null,
  urlQueryString: '',
} as React.ContextType<typeof TimesSquareUrlParametersContext>;

function renderApp(children: React.ReactNode) {
  return render(
    <TimesSquareUrlParametersContext.Provider value={contextValue}>
      <TimesSquareApp pageNav={<div>nav</div>}>{children}</TimesSquareApp>
    </TimesSquareUrlParametersContext.Provider>
  );
}

test('does not render its own main landmark', () => {
  // The single <main> landmark is owned by the root layout's AppShell.
  renderApp(<div>notebook</div>);

  expect(screen.queryByRole('main')).not.toBeInTheDocument();
});

test('renders its children', () => {
  renderApp(<div>notebook body</div>);

  expect(screen.getByText('notebook body')).toBeInTheDocument();
});
