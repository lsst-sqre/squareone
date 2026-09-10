---
'@lsst-sqre/tsconfig': minor
'squareone': patch
'@lsst-sqre/squared': patch
'@lsst-sqre/file-factory': patch
---

Update TypeScript from 5.9 to 6.0, the bridge release before the native TypeScript 7 compiler. The shared `base.json` preset now uses `moduleResolution: "bundler"` instead of the removed `node` (node10) mode, and squareone drops the deprecated `baseUrl` in favor of a relative `paths` entry. Both options stop working in TypeScript 7.
