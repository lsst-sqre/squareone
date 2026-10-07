import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(),
}));

vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/repertoire-client')>()),
  useServiceDiscovery: vi.fn(),
}));

import {
  getEmptyDiscovery,
  mockDiscoveryDataDev,
  type ServiceDiscovery,
  useServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
// Import after mocking.
import { useRepertoireUrl } from '../../../hooks/useRepertoireUrl';
import DiscoveryPageClient from './DiscoveryPageClient';

const REPERTOIRE_URL = 'https://data-dev.lsst.cloud/repertoire';

/** Make useServiceDiscovery report the given state; returns its refetch spy. */
function mockDiscoveryState({
  discovery,
  isPending = false,
  isFetching = false,
  isError = false,
}: {
  discovery?: ServiceDiscovery;
  isPending?: boolean;
  isFetching?: boolean;
  isError?: boolean;
}) {
  const refetch = vi.fn();
  vi.mocked(useServiceDiscovery).mockReturnValue({
    discovery,
    query: null,
    refetch,
    isStale: false,
    isPending,
    isFetching,
    isError,
    error: isError ? new Error('boom') : null,
  } as unknown as ReturnType<typeof useServiceDiscovery>);
  return refetch;
}

describe('DiscoveryPageClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRepertoireUrl).mockReturnValue(REPERTOIRE_URL);
  });

  test('shows the not-configured note without a Repertoire URL', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(undefined);
    // Without a URL the discovery query is disabled and stays pending.
    mockDiscoveryState({ isPending: true });

    render(<DiscoveryPageClient />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Service discovery' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /service discovery is not configured for this environment/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/loading service discovery/i)
    ).not.toBeInTheDocument();
  });

  test('renders the document as pretty-printed JSON in a code block', () => {
    mockDiscoveryState({ discovery: mockDiscoveryDataDev });

    render(<DiscoveryPageClient />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Service discovery' })
    ).toBeInTheDocument();
    const block = screen.getByRole('group', { name: 'Service discovery JSON' });
    const code = block.querySelector('code');
    expect(code).toHaveClass('language-json');
    expect(code?.textContent).toBe(
      JSON.stringify(mockDiscoveryDataDev, null, 2)
    );
    expect(code?.textContent).toContain('\n  "applications": [\n');
  });

  test('numbers the lines and offers to copy the document', () => {
    mockDiscoveryState({ discovery: mockDiscoveryDataDev });

    render(<DiscoveryPageClient />);

    const block = within(
      screen.getByRole('group', { name: 'Service discovery JSON' })
    );
    const lineCount = JSON.stringify(mockDiscoveryDataDev, null, 2).split(
      '\n'
    ).length;
    // The gutter holds one number per line; getByText collapses its newlines.
    expect(
      block.getByText(new RegExp(`^1 2 3 .* ${lineCount}$`))
    ).toHaveAttribute('aria-hidden', 'true');
    expect(
      block.getByRole('button', { name: 'Copy code to clipboard' })
    ).toBeInTheDocument();
  });

  test('links to the discovery document it shows', () => {
    mockDiscoveryState({ discovery: mockDiscoveryDataDev });

    render(<DiscoveryPageClient />);

    expect(
      screen.getByRole('link', {
        name: 'https://data-dev.lsst.cloud/repertoire/discovery',
      })
    ).toHaveAttribute(
      'href',
      'https://data-dev.lsst.cloud/repertoire/discovery'
    );
  });

  test('notes that the cached document may be out of date', () => {
    mockDiscoveryState({ discovery: mockDiscoveryDataDev });

    render(<DiscoveryPageClient />);

    expect(
      screen.getByText(/caches service discovery for 5 minutes/)
    ).toBeInTheDocument();
  });

  test('refetches the document from the Refetch button', async () => {
    const refetch = mockDiscoveryState({ discovery: mockDiscoveryDataDev });
    const user = userEvent.setup();

    render(<DiscoveryPageClient />);

    await user.click(screen.getByRole('button', { name: 'Refetch' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test('disables Refetch while a fetch is in flight', () => {
    mockDiscoveryState({ discovery: mockDiscoveryDataDev, isFetching: true });

    render(<DiscoveryPageClient />);

    expect(screen.getByRole('button', { name: 'Refetch' })).toBeDisabled();
    // The current document stays on screen while the refetch runs.
    expect(
      screen.getByRole('group', { name: 'Service discovery JSON' })
    ).toBeInTheDocument();
  });

  test('reads discovery from the configured Repertoire URL', () => {
    mockDiscoveryState({ isPending: true });

    render(<DiscoveryPageClient />);

    expect(useServiceDiscovery).toHaveBeenCalledWith(REPERTOIRE_URL);
  });

  test('shows a loading state while discovery is pending', () => {
    mockDiscoveryState({ isPending: true });

    render(<DiscoveryPageClient />);

    expect(screen.getByText(/loading service discovery/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('warns, with a retry, when the discovery query errors', async () => {
    const refetch = mockDiscoveryState({ isError: true });
    const user = userEvent.setup();

    render(<DiscoveryPageClient />);

    expect(
      screen.getByText(/could not load service discovery/i)
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test('warns, with a retry, when discovery comes back empty', () => {
    // A failed fetch resolves to the empty discovery rather than an error.
    mockDiscoveryState({ discovery: getEmptyDiscovery() });

    render(<DiscoveryPageClient />);

    expect(
      screen.getByText(/could not load service discovery/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Refetch' })
    ).not.toBeInTheDocument();
  });
});
