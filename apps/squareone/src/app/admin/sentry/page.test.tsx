import { render, screen } from '@testing-library/react';
import type React from 'react';
import { describe, expect, test, vi } from 'vitest';

// Stub the child components so these tests exercise only the page's own copy;
// both are client components with their own config/Sentry dependencies.
vi.mock('../../../components/SentryTestButtons', () => ({
  default: () => <div data-testid="sentry-test-buttons" />,
}));
vi.mock('../../../components/SentryConfigInfo', () => ({
  default: () => <div data-testid="sentry-config-info" />,
}));

// The page's scope gate is a pass-through here: these tests are about the
// page's own copy. The gate's behaviour is covered by AdminRequired's tests,
// and `src/tests/adminPageGates.test.ts` is what proves this page still
// declares one.
vi.mock('../../../components/AdminRequired', () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Import after mocking.
import SentryAdminPage from './page';

describe('SentryAdminPage', () => {
  test('says the error buttons surface as issues in the Sentry project', () => {
    render(<SentryAdminPage />);

    expect(
      screen.getByText(/appear as issues in the Sentry project/i)
    ).toBeInTheDocument();
  });

  test('points at Explore > Logs for the server-log smoke test', () => {
    // The emit-log records deliberately never create an issue, so an operator
    // told to look in the Sentry project would find nothing and conclude the
    // bridge is broken.
    render(<SentryAdminPage />);

    expect(screen.getByText('Explore > Logs')).toBeInTheDocument();
  });
});
