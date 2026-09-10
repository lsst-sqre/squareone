---
'squareone': patch
'@lsst-sqre/squared': patch
'@lsst-sqre/gafaelfawr-client': patch
'@lsst-sqre/repertoire-client': patch
'@lsst-sqre/semaphore-client': patch
'@lsst-sqre/times-square-client': patch
---

Update the test and Storybook toolchain to Vite 8, which builds with Rolldown and Oxc instead of Rollup and esbuild. `@vitejs/plugin-react` moves to 6 (which requires Vite 8) and jsdom moves from 26 to 30, now declared explicitly by every package whose tests run in a jsdom environment. The squareone unit-test project sets its JSX runtime through Vite's `oxc` option instead of the deprecated `esbuild` option, and squared's Vite config is renamed to `vite.config.mts` so it loads under Vite's upcoming native config loader.
