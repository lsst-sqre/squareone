import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../hooks/useRepertoireUrl', () => ({
  useRepertoireUrl: vi.fn(),
}));

vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@lsst-sqre/repertoire-client')>()),
  useServiceDiscovery: vi.fn(),
}));

import {
  getEmptyDiscovery,
  mockDiscovery2x,
  mockDiscoveryDataDev,
  type ServiceDiscovery,
  useServiceDiscovery,
} from '@lsst-sqre/repertoire-client';
// Import after mocking.
import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import AdminOverviewClient from './AdminOverviewClient';

const REPERTOIRE_URL = 'https://data-dev.lsst.cloud/repertoire';

/** Make useServiceDiscovery report the given state; returns its refetch spy. */
function mockDiscoveryState({
  discovery,
  isPending = false,
  isError = false,
}: {
  discovery?: ServiceDiscovery;
  isPending?: boolean;
  isError?: boolean;
}) {
  const refetch = vi.fn();
  vi.mocked(useServiceDiscovery).mockReturnValue({
    discovery,
    query: null,
    refetch,
    isStale: false,
    isPending,
    isError,
    error: isError ? new Error('boom') : null,
  } as unknown as ReturnType<typeof useServiceDiscovery>);
  return refetch;
}

describe('AdminOverviewClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRepertoireUrl).mockReturnValue(REPERTOIRE_URL);
  });

  test('reads discovery from the configured Repertoire URL', () => {
    mockDiscoveryState({ discovery: mockDiscoveryDataDev });

    render(<AdminOverviewClient />);

    expect(useServiceDiscovery).toHaveBeenCalledWith(REPERTOIRE_URL);
  });

  test('shows a loading state while discovery is pending', () => {
    mockDiscoveryState({ isPending: true });

    render(<AdminOverviewClient />);

    expect(screen.getByText(/loading service discovery/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /retry/i })
    ).not.toBeInTheDocument();
  });

  test('renders the overview from a 2.x discovery without errors', () => {
    mockDiscoveryState({ discovery: mockDiscovery2x });

    render(<AdminOverviewClient />);

    expect(
      screen.getByRole('region', { name: 'Environment' })
    ).toHaveTextContent('data.lsst.cloud');
  });

  test('warns, with a retry, when discovery comes back empty', async () => {
    // A failed fetch resolves to the empty discovery rather than an error.
    const refetch = mockDiscoveryState({ discovery: getEmptyDiscovery() });
    const user = userEvent.setup();

    render(<AdminOverviewClient />);

    expect(
      screen.getByText(/could not load service discovery/i)
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test('warns, with a retry, when the discovery query errors', async () => {
    const refetch = mockDiscoveryState({ isError: true });
    const user = userEvent.setup();

    render(<AdminOverviewClient />);

    expect(
      screen.getByText(/could not load service discovery/i)
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  test('shows the not-configured note, not a loading state, without a Repertoire URL', () => {
    vi.mocked(useRepertoireUrl).mockReturnValue(undefined);
    mockDiscoveryState({ isPending: true });

    render(<AdminOverviewClient />);

    expect(
      screen.getByText(
        /service discovery is not configured for this environment/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/loading service discovery/i)
    ).not.toBeInTheDocument();
  });
});
