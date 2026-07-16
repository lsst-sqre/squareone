import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { TimesSquareUrlParametersContext } from '../TimesSquareUrlParametersProvider';
import TimesSquareApp from './TimesSquareApp';
import styles from './TimesSquareApp.module.css';

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

/*
 * Structural guard for the responsive reflow (WCAG 1.4.10 / PRD #550 stream 2,
 * task #567). The column/row stacking itself is CSS-media-query driven and
 * cannot be observed in jsdom (no media-query evaluation or layout), so it is
 * verified end-to-end in a real browser during development. What we can pin
 * here is that the layout and content wrappers actually carry their CSS Module
 * classes — i.e. the stylesheet's reflow rules are hooked up to the elements
 * that render them. Without this, a class rename or a removed wrapper would
 * silently detach the responsive CSS with no failing test.
 */
test('wires the layout and content CSS Module classes to their wrappers', () => {
  const { container } = renderApp(<div>notebook body</div>);

  const layout = container.querySelector(`.${styles.layout}`);
  expect(layout).not.toBeNull();

  const content = layout?.querySelector(`.${styles.content}`);
  expect(content).not.toBeNull();
  // The page content is rendered inside the content wrapper, not beside it.
  expect(content).toHaveTextContent('notebook body');
});
