---
"@lsst-sqre/global-css": patch
"squareone": patch
---

Fix the `next/image` aspect-ratio warning ("width or height modified, but not the
other") surfaced under Next.js 16, and the latent logo distortion behind it.

- Footer partner logos now use a new `img.u-responsive-image` global utility
  (`max-width: 100%; width: auto; height: auto;`) so both dimensions scale together
  as the image fills its container.
- The header triad logo keeps its controlled height: its computed width is now
  rounded to an integer (a fractional width attribute can never equal the rounded
  rendered width, which tripped the warning) and it uses `height: auto` so it scales
  proportionally on narrow viewports without expanding to the source image's natural
  size.
