import { readFileSync } from 'node:fs';
import path from 'node:path';
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

/*
 * Reflow guard (WCAG 1.4.10 / PRD #550 stream 2, task #567): the Times Square
 * layout must stack the sidebar above the content on narrow viewports so no
 * page scrolls horizontally at a 320px viewport. The row layout (sidebar beside
 * content) is only applied at or above the shared 60rem collapse breakpoint.
 *
 * This behavior is CSS-media-query driven and cannot be observed in jsdom
 * (which evaluates no media queries or layout), so it is verified end-to-end in
 * a real browser during development; this source-level assertion is a
 * regression guard against a future edit silently dropping the media query.
 */
test('layout stacks vertically below the 60rem breakpoint and rows above it', () => {
  const css = readFileSync(
    path.resolve(
      process.cwd(),
      'src/components/TimesSquareApp/TimesSquareApp.module.css'
    ),
    'utf8'
  );

  // The base (mobile-first) .layout rule must stack children in a column so a
  // full-width sidebar sits above the content rather than beside it.
  const baseLayout = css.match(/\.layout\s*\{[^}]*\}/)?.[0] ?? '';
  expect(baseLayout).toMatch(/flex-direction:\s*column/);

  // The row layout is reintroduced only inside a min-width: 60rem media query,
  // matching the SidebarLayout and PrimaryNavigation collapse breakpoint.
  expect(css).toMatch(
    /@media\s*\(min-width:\s*60rem\)\s*\{[\s\S]*?flex-direction:\s*row/
  );
});
