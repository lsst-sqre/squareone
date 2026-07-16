// Type augmentation for vitest-axe's accessibility matcher.
//
// vitest-axe ships its own `extend-expect` augmentation, but it targets the
// legacy `Vi.Assertion` namespace rather than the `vitest` module interface
// that Vitest 4 resolves. Declaring the matcher against `declare module
// 'vitest'` here (the same pattern @testing-library/jest-dom uses) makes
// `expect(...).toHaveNoViolations()` type-check under Vitest 4.
import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
