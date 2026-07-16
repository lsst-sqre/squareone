import '@testing-library/jest-dom';
import { expect } from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

// Register vitest-axe's accessibility matcher (`toHaveNoViolations`) so unit
// tests can assert that a rendered component has zero axe-core violations.
expect.extend(axeMatchers);

// Polyfills for JSDOM environment needed by Radix UI components
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

// Mock ResizeObserver which is used by Radix UI
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock scrollIntoView which is used by Radix UI focus management
Element.prototype.scrollIntoView = () => {};

// Mock window.matchMedia which jsdom does not implement. Components such as
// PrimaryNavigation read it during mount. Individual tests can override this
// with a controllable implementation to drive `change` events.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
