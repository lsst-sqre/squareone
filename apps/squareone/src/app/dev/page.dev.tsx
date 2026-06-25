'use client';

import MainContent from '../../components/MainContent';
import DevAuthPanel from './DevAuthPanel';
import DevNotificationsPanel from './DevNotificationsPanel';

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
 * and edit the active Gafaelfawr scopes and identity at runtime, and the
 * {@link DevNotificationsPanel}, which sets the mocked unread-notification count
 * that drives the header badge.
 */
export default function DevPage() {
  return (
    <MainContent>
      <DevAuthPanel />
      <DevNotificationsPanel />
    </MainContent>
  );
}
