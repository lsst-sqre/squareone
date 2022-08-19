import React from 'react';

import TimesSquareGitHubNav from './TimesSquareGitHubNav';

export default {
  component: TimesSquareGitHubNav,
  title: 'Components/TimesSquare/GitHubNav',
  parameters: {
    viewport: {
      viewports: {
        sidebar: {
          name: 'Sidebar',
          styles: {
            width: '280px',
            height: '900px',
          },
        },
      },
    },
    defaultViewport: 'sidebar',
  },
};

const Template = (args) => <TimesSquareGitHubNav {...args} />;

const exampleGitHubContents = [
  {
    node_type: 'owner',
    path: 'lsst-sqre',
    title: 'lsst-sqre',
    contents: [
      {
        node_type: 'repo',
        path: 'lsst-sqre/times-square-demo',
        title: 'times-square-demo',
        contents: [
          {
            node_type: 'page',
            path: 'lsst-sqre/times-square-demo/demo',
            title: 'Sine wave',
            contents: [],
          },
          {
            node_type: 'page',
            path: 'lsst-sqre/times-square-demo/long',
            title: 'A page with a very long title that wraps',
            contents: [],
          },
          {
            node_type: 'directory',
            path: 'lsst-sqre/times-square-demo/matplotlib',
            title: 'matplotlib',
            contents: [
              {
                node_type: 'page',
                path: 'lsst-sqre/times-square-demo/matplotlib/gaussian2d',
                title: 'Gaussian 2D',
                contents: [],
              },
            ],
          },
          {
            node_type: 'directory',
            path: 'lsst-sqre/times-square-demo/nightly',
            title: 'nightly',
            contents: [
              {
                node_type: 'page',
                path: 'lsst-sqre/times-square-demo/nightly/auxtel',
                title: 'AuxTel Nightly Report',
                contents: [],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const Default = Template.bind({});
Default.args = {
  contentNodes: exampleGitHubContents,
  pagePath: '',
  pagePathRoot: '/times-square/github',
};

export const ActivePage = Template.bind({});
ActivePage.args = {
  contentNodes: exampleGitHubContents,
  pagePath: 'lsst-sqre/times-square-demo/matplotlib/gaussian2d',
  pagePathRoot: '/times-square/github',
};
