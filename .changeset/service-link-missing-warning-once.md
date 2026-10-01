---
'squareone': patch
---

When a `<ServiceLink service="…">` names a service that Repertoire service discovery doesn't list, such as a misspelled `service="comange"`, Squareone now logs the warning only once per server process for each service name, instead of on every page view. A misnamed service in `footer.mdx` no longer logs a warning on every page of the site for every request. The tag still renders its fallback on every page until the MDX is fixed.
