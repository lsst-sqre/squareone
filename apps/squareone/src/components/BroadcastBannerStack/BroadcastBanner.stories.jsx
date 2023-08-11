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
  category: 'maintenance',
};

export const Default = {
  render: () => <BroadcastBanner broadcast={broadcastData} />,
};
