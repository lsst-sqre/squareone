---
'@lsst-sqre/squared': minor
---

Replace tsup build with direct TypeScript transpilation

Replaced the tsup build tool with direct TypeScript transpilation through the consuming applications. This change:

- Exports TypeScript source files directly from the package
- Lets Next.js and other consuming apps handle transpilation
- Simplifies the build pipeline and removes the build step from the squared package
- Improves development experience with faster HMR