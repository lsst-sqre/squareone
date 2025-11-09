---
"@lsst-sqre/eslint-config": patch
"@lsst-sqre/squared": patch
"squareone": patch
---

Align dependency versions across packages to prepare for Dependabot groups

- Update eslint-config-next from 12.2.4 to 15.5.0 in eslint-config package
- Standardize eslint to 8.46.0 across squared and squareone packages
- Update swr from 2.2.1 to 2.3.6 in squared package
- Update @fortawesome/react-fontawesome from 0.2.0 to 0.2.2 in squareone package

These version alignments eliminate inconsistencies that could cause conflicts when Dependabot groups are enabled for coordinated dependency updates.
