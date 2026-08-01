---
'squareone': patch
---

Resolve 12 open Dependabot security advisories in transitive dependencies

Adds a root `pnpm.overrides` block pinning patched versions of
`brace-expansion`, `js-yaml`, `postcss`, `immutable`, and `fast-uri`, and
moves the vitest family to 4.1.10 within its existing `^4.1.0` range. All of
these were transitive-only dependencies that Dependabot could not update on
its own — five alerts reported `update_not_possible` and the rest never
produced a pull request.
