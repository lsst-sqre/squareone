---
"squareone": patch
---

Migrate from next/legacy/image to next/image

Upgraded the remaining Image components from the legacy `next/legacy/image` import to the modern `next/image` component. This is part of the Next.js 15 upgrade to remove deprecated APIs.

**Components updated:**

- `PreHeader` - Header logo image
- `Footer` - Agency partner logos
- `FooterComponents` - PartnerLogos MDX component

**Changes:**

- Replaced `import Image from 'next/legacy/image'` with `import Image from 'next/image'`
- Added responsive styling with `style={{ maxWidth: '100%', width: 'auto', height: 'auto' }}` to maintain aspect ratios
- Both `width` and `height` set to `'auto'` to satisfy Next.js 13+ Image component requirements

The SidebarLayout component had minor whitespace cleanup.
