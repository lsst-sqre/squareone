---
'@lsst-sqre/squared': minor
---

Add TAP quota types and improve nullable handling in useGafaelfawrUser

The `useGafaelfawrUser` hook now includes complete type definitions for all Gafaelfawr quota types, supporting the new quotas page feature:

**New types added:**
- `GafaelfawrTapQuota`: Represents TAP service concurrent query limits with a `concurrent` field
- All quota-related types are now exported: `GafaelfawrQuota`, `GafaelfawrNotebookQuota`, `GafaelfawrApiQuota`, `GafaelfawrTapQuota`, `GafaelfawrGroup`

**Type improvements:**
- `GafaelfawrNotebookQuota`: Added `spawn: boolean` field to indicate if notebook spawning is allowed
- `GafaelfawrQuota`: Added `tap` field for TAP service quotas; made `notebook` explicitly nullable (`| null`)
- `GafaelfawrUser`: Made `quota` field explicitly nullable (`| null`) to properly handle API responses

These changes align with the Gafaelfawr API specification and enable proper handling of quota data in the quotas page, including null/empty states for optional quota sections.
