---
'squareone': minor
---

Show storage quotas on the quotas page

The `/settings/quotas` page has a new "Storage" section, directly below "Notebooks", that lists the user's disk quota for each filesystem mount from Gafaelfawr, one row per mount point sorted by mount point. Mount points are shown in a monospace font. Sizes are shown in binary units with IEC labels, such as `30 GiB` for a `/home` quota of 32212254720 bytes. The section is hidden when the user has no disk quotas.
