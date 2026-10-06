---
'squareone': minor
---

The header navigation and the homepage hero now hide the Portal and Notebooks entries from a signed-in user who lacks a Gafaelfawr scope that the service declares in Repertoire service discovery (`required_scopes`, added in Repertoire 3.0.0). For example, on data-dev a user without `exec:portal` no longer sees Portal, and a user without `exec:notebook` no longer sees Notebooks. Anonymous visitors, users whose login information is still loading, and environments whose discovery declares no required scopes see both entries as before. The existing loading behavior is unchanged: the navigation shows its entries while discovery loads, and the hero shows its cards once discovery has loaded.
