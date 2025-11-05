---
'squareone': patch
---

Fix TokenForm scope selector layout and focus behavior

Replaced CSS columns with CSS Grid layout in TokenForm's ScopeSelector to fix focus ring fragmentation issues. The Grid layout provides better control over item positioning and prevents focus rings from being split across column breaks, improving keyboard navigation accessibility.
