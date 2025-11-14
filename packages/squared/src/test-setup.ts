import '@testing-library/jest-dom';

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
