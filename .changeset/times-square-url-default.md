---
'squareone': minor
---

The `timesSquareUrl` configuration key now defaults from Repertoire service discovery, so it no longer needs to be set for each Phalanx environment. When it is omitted, Squareone uses the Times Square internal service URL from discovery (`services.internal.times-square.url`, without the trailing slash), which discovery lists only in environments where Times Square is deployed. This works with Repertoire 2.x as well as 3.x. An explicitly configured `timesSquareUrl` still takes precedence, and the `/times-square/` pages are disabled (404) only when neither the configuration nor discovery provides a URL.
