---
'squareone': patch
---

The root layout now prefetches the signed-in user's Gafaelfawr login info on the server, forwarding the request's session cookie, and hydrates it alongside service discovery. The header navigation, homepage hero, and Apps menu therefore know the user's scopes on their first render: Portal and Notebooks no longer appear briefly and then disappear for a user who lacks the required scope, and the Apps menu's scope-gated items (and the Apps menu itself, when those are all it lists) no longer pop in after the page loads. For an anonymous visitor the login info hydrates as empty, so what they see is unchanged. Because the hydrated login info is fresh, the browser also no longer requests it again on page load.
