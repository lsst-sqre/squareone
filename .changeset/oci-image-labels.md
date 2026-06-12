---
"squareone": patch
---

Add standard OCI image labels to the squareone Docker image.

The runner stage now sets `org.opencontainers.image.source`, `url`, `title`,
`description`, `vendor`, `licenses`, `revision`, and `version`. The `source`
label links the GHCR package to its repository (inheriting the repo's
visibility/access), and the static fields surface a title, description, and
license on the package page. `version` comes from a new `VERSION` build arg and
mirrors the image's primary tag: the release version for releases, and the
branch-derived tag for PR/branch builds (e.g. `tickets-DM-55226`).
