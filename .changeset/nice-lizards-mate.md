---
'squareone': minor
---

The Times Square UI now closes its connection to the `/times-square/pages/:page/html/events?<qs>` SSE endpoint once the page instance's execution status is "complete" and the HTML hash is computed. With this change, the Times Square UI reduces its ongoing load on the API and also reduces network usage. The HTML page will still update to the latest version because the iframe component pings the Times Square `pages/:page/htmlstatus?<qs>` endpoint. We may back this off or convert the page update to an opt-in future in the future to further reduce network and API load from the front-end.
