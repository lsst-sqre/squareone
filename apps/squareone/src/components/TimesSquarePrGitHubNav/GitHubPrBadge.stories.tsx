import React from 'react';
import GitHubPrBadge from './GitHubPrBadge';

export default {
  component: GitHubPrBadge,
  title: 'Components/TimesSquare/GitHubPrBadge',
};

const Template = (args: React.ComponentProps<typeof GitHubPrBadge>) => (
  <GitHubPrBadge {...args} />
);

export const OpenPr = Template.bind({});
OpenPr.args = {
  state: 'open' as const,
  number: 93,
  url: 'https://github.com/lsst-sqre/squareone/pull/93',
  title: 'DM-35954: Develop Times Square UI with storybook',
  authorName: 'jonathansick',
  authorAvatarUrl: 'https://avatars.githubusercontent.com/u/349384?v=4',
  authorUrl: 'https://github.com/jonathansick',
};

export const DraftPr = Template.bind({});
DraftPr.args = {
  state: 'draft' as const,
  number: 93,
  url: 'https://github.com/lsst-sqre/squareone/pull/93',
  title: 'DM-35954: Develop Times Square UI with storybook',
  authorName: 'jonathansick',
  authorAvatarUrl: 'https://avatars.githubusercontent.com/u/349384?v=4',
  authorUrl: 'https://github.com/jonathansick',
};

export const MergedPr = Template.bind({});
MergedPr.args = {
  state: 'merged' as const,
  number: 93,
  url: 'https://github.com/lsst-sqre/squareone/pull/93',
  title: 'DM-35954: Develop Times Square UI with storybook',
  authorName: 'jonathansick',
  authorAvatarUrl: 'https://avatars.githubusercontent.com/u/349384?v=4',
  authorUrl: 'https://github.com/jonathansick',
};

export const ClosedPr = Template.bind({});
ClosedPr.args = {
  state: 'closed' as const,
  number: 93,
  url: 'https://github.com/lsst-sqre/squareone/pull/93',
  title: 'DM-35954: Develop Times Square UI with storybook',
  authorName: 'jonathansick',
  authorAvatarUrl: 'https://avatars.githubusercontent.com/u/349384?v=4',
  authorUrl: 'https://github.com/jonathansick',
};
