import React from 'react';
import GitHubPrTitle from './GitHubPrTitle';

export default {
  component: GitHubPrTitle,
  title: 'Components/TimesSquare/GitHubPrTitle',
};

const Template = (args: React.ComponentProps<typeof GitHubPrTitle>) => (
  <GitHubPrTitle {...args} />
);

export const Default = Template.bind({});
Default.args = {
  owner: 'lsst-sqre',
  repo: 'times-square-demo',
  commit: 'e35e1d5c485531ba9e99081c52dbdc5579e00556',
};
