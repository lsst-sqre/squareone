---
'@lsst-sqre/squared': patch
---

Add accessibility test infrastructure. `vitest-axe` is now wired into the squared unit-test toolchain: the shared `test-setup.ts` registers its `toHaveNoViolations` matcher, and the `Label` component test includes an example assertion that a rendered component has zero axe-core violations. This complements the `@storybook/addon-a11y` checks that already run in the Storybook (browser) test project, giving later accessibility work a way to self-verify at the unit level.
