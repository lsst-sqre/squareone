---
'squareone': minor
---

The header's Apps menu (enabled with `enableAppsMenu`) now builds its items from Repertoire service discovery instead of needing every entry listed in `appLinks`. It lists, in order:

- Times Square (`/times-square/`), when the `times-square` application is enabled.
- The Argo CD, Chronograf, Kafdrop, and WebDAV UI services from discovery that the signed-in user can access, labelled by their discovery titles. A service's discovery `required_scopes` decide access. Argo CD and Chronograf declare none, so they need `exec:admin` instead, so that these admin tools aren't advertised to every user. Kafdrop needs `exec:internal-tools` and WebDAV `write:files` when discovery declares no scopes for them. These items appear only once the user's scopes are known, so anonymous visitors don't see them.
- The configured `appLinks`, which are now additive extras for apps that discovery does not describe. A link whose `href` repeats an earlier item is dropped. Relative hrefs are compared against the discovered URLs, and trailing slashes are ignored, so a configured `/argo-cd/` does not duplicate the discovered Argo CD entry.

The menu is hidden when it has no items. Without service discovery (no `repertoireUrl`), the menu lists only the `appLinks`, as before.
