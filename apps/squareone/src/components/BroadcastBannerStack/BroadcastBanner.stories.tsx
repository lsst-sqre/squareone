import BroadcastBanner from './BroadcastBanner';

export default {
  title: 'Components/BroadcastBanner',
  component: BroadcastBanner,
};

const broadcastData = {
  id: '1234',
  summary: {
    gfm: 'Hello world.',
    html: '<p>Hello world.</p>',
  },
  body: {
    gfm: 'This is the body content.',
    html: '<p>This is the body content.</p>',
  },
  active: true,
  enabled: true,
  stale: false,
  category: 'other' as const,
};

export const Default = {
  render: () => <BroadcastBanner broadcast={broadcastData} />,
};

export const Info = {
  render: () => (
    <BroadcastBanner broadcast={{ ...broadcastData, category: 'info' }} />
  ),
};

export const Outage = {
  render: () => (
    <BroadcastBanner broadcast={{ ...broadcastData, category: 'outage' }} />
  ),
};

export const Notice = {
  render: () => (
    <BroadcastBanner broadcast={{ ...broadcastData, category: 'notice' }} />
  ),
};
