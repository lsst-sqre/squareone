'use client';

import MainContent from '../../components/MainContent';
import DevAuthPanel from './DevAuthPanel';

/**
 * Dev-only auth control panel route (`/dev`).
 *
 * The `.dev.tsx` suffix means this file is only built into the development
 * server (see `pageExtensions` in `next.config.js`). Production builds omit the
 * `dev.*` extensions, so Next.js never recognizes this as a route and it never
 * enters `.next/` or the Docker image.
 *
 * This is the first piece of a future dev-tools hub. For now it renders the
 * {@link DevAuthPanel}, which lets a developer flip login state, pick a persona,
 * and edit the active Gafaelfawr scopes and identity at runtime. The mocked
 * unread-notification count is no longer set here: the user-notifications dev
 * mock now serves a persistent notification list (see `userNotificationsStore`),
 * so the header badge reflects the seeded notifications and any that are marked
 * read from the inbox.
 */
export default function DevPage() {
  return (
    <MainContent>
      <DevAuthPanel />
    </MainContent>
  );
}
