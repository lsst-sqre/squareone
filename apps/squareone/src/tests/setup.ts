import '@testing-library/jest-dom';
import { expect, vi } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

// Register vitest-axe's accessibility matcher (`toHaveNoViolations`) so unit
// tests can assert that a rendered component has zero axe-core violations.
expect.extend(axeMatchers);

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock ResizeObserver
// Vitest 4 requires constructor mock implementations to use the `function`
// keyword (arrow functions are not constructable).
// biome-ignore lint/complexity/useArrowFunction: must stay a constructable function for Vitest 4
global.ResizeObserver = vi.fn().mockImplementation(function () {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

// Mock IntersectionObserver
// biome-ignore lint/complexity/useArrowFunction: must stay a constructable function for Vitest 4
global.IntersectionObserver = vi.fn().mockImplementation(function () {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo
global.scrollTo = vi.fn();

// Polyfills for the JSDOM environment needed by Radix UI popover-style
// components (e.g. DropdownMenu): pointer capture and scrollIntoView are used
// by Radix's focus management and are absent in JSDOM. Mirrors the squared
// package's test setup.
Object.defineProperty(Element.prototype, 'hasPointerCapture', {
  value: () => false,
  writable: true,
});
Object.defineProperty(Element.prototype, 'setPointerCapture', {
  value: () => {},
  writable: true,
});
Object.defineProperty(Element.prototype, 'releasePointerCapture', {
  value: () => {},
  writable: true,
});
Element.prototype.scrollIntoView = () => {};
