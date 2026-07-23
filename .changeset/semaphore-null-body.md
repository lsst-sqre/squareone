---
"@lsst-sqre/semaphore-client": patch
"squareone": patch
---

Fix broadcast parsing for broadcasts with a null body (DM-55599). The Semaphore API always includes the `body` field and sends `null` when a broadcast has no body content, but the zod `BroadcastSchema` only allowed the field to be omitted, so any broadcast with a null body failed parsing and no broadcasts were displayed. The schema now accepts a null (or omitted) body, and the broadcast banner omits the "Show more" disclosure button when there is no body to disclose. Also refreshed the Semaphore `openapi.json` to the current production schema (2.0.0).
