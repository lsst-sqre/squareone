import type { Broadcast, BroadcastsResponse } from './schemas';

/**
 * A mock outage broadcast message.
 */
export const mockOutageBroadcast: Broadcast = {
  id: 'broadcast-001',
  summary: {
    gfm: 'Scheduled maintenance on **February 1, 2025** from 06:00–10:00 UTC.',
    html: '<p>Scheduled maintenance on <strong>February 1, 2025</strong> from 06:00–10:00 UTC.</p>',
  },
  body: {
    gfm: 'The Rubin Science Platform will be unavailable during this window for database upgrades.',
    html: '<p>The Rubin Science Platform will be unavailable during this window for database upgrades.</p>',
  },
  active: true,
  enabled: true,
  stale: false,
  category: 'outage',
};

/**
 * A mock info broadcast message.
 */
const mockInfoBroadcast: Broadcast = {
  id: 'broadcast-002',
  summary: {
    gfm: 'New tutorial notebooks are available in the **Times Square** gallery.',
    html: '<p>New tutorial notebooks are available in the <strong>Times Square</strong> gallery.</p>',
  },
  active: true,
  enabled: true,
  stale: false,
  category: 'info',
};

/**
 * A mock notice broadcast message.
 */
const mockNoticeBroadcast: Broadcast = {
  id: 'broadcast-003',
  summary: {
    gfm: 'Please review the updated [data rights policy](https://example.com/policy).',
    html: '<p>Please review the updated <a href="https://example.com/policy">data rights policy</a>.</p>',
  },
  active: true,
  enabled: true,
  stale: false,
  category: 'notice',
};

/**
 * A typical set of mock broadcast messages.
 */
export const mockBroadcasts: BroadcastsResponse = [
  mockOutageBroadcast,
  mockInfoBroadcast,
];

/**
 * Empty broadcasts response.
 */
export const emptyBroadcasts: BroadcastsResponse = [];

/**
 * All category types represented.
 */
export const allCategoryBroadcasts: BroadcastsResponse = [
  mockOutageBroadcast,
  mockInfoBroadcast,
  mockNoticeBroadcast,
];
