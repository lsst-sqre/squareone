import GitHubCheckBadge from './GitHubCheckBadge';

export default {
  component: GitHubCheckBadge,
  title: 'Components/TimesSquare/GitHubCheckBadge',
};

const Template = (args: any) => <GitHubCheckBadge {...args} />;

export const Success = Template.bind({});
Success.args = {
  status: 'completed' as const,
  title: 'Notebook execution',
  conclusion: 'success' as const,
  url: '#',
};

export const Failure = Template.bind({});
Failure.args = {
  status: 'completed' as const,
  title: 'Notebook execution',
  conclusion: 'failure' as const,
  url: '#',
};

export const Cancelled = Template.bind({});
Cancelled.args = {
  status: 'completed' as const,
  title: 'Notebook execution',
  conclusion: 'cancelled' as const,
  url: '#',
};

export const InProgress = Template.bind({});
InProgress.args = {
  status: 'in_progress' as const,
  title: 'Notebook execution',
  conclusion: null,
  url: '#',
};
