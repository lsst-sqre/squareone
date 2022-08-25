import React from 'react';

import GitHubCheckBadge from './GitHubCheckBadge';

export default {
  component: GitHubCheckBadge,
  title: 'Components/TimesSquare/GitHubCheckBadge',
};

const Template = (args) => <GitHubCheckBadge {...args} />;

export const Success = Template.bind({});
Success.args = {
  status: 'completed',
  title: 'Notebook execution',
  conclusion: 'success',
  url: '#',
};

export const Failure = Template.bind({});
Failure.args = {
  status: 'completed',
  title: 'Notebook execution',
  conclusion: 'failure',
  url: '#',
};

export const Cancelled = Template.bind({});
Cancelled.args = {
  status: 'completed',
  title: 'Notebook execution',
  conclusion: 'cancelled',
  url: '#',
};

export const InProgress = Template.bind({});
InProgress.args = {
  status: 'in_progress',
  title: 'Notebook execution',
  conclusion: null,
  url: '#',
};
