import React from 'react';
import type { Meta, StoryFn } from '@storybook/nextjs-vite';

import { TimesSquareHtmlEventsContext } from '../TimesSquareHtmlEventsProvider';
import ExecStats from './ExecStats';

type HtmlEventContextProps = {
  dateSubmitted: string | null;
  dateStarted: string | null;
  dateFinished: string | null;
  executionStatus: string | null;
  executionDuration: number | null;
  htmlHash: string | null;
  htmlUrl: string | null;
};

export default {
  component: ExecStats,
  title: 'Components/TimesSquare/ExecStats',
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
} as Meta<typeof ExecStats>;

const Template: StoryFn<HtmlEventContextProps> = (args) => (
  <TimesSquareHtmlEventsContext.Provider value={args}>
    <ExecStats />
  </TimesSquareHtmlEventsContext.Provider>
);

export const Default = Template.bind({});
Default.args = {
  dateSubmitted: '2021-09-01T12:00:00Z',
  dateStarted: '2021-09-01T12:00:01Z',
  dateFinished: '2021-09-01T12:00:10Z',
  executionStatus: 'complete',
  executionDuration: 10.12,
  htmlHash: null,
  htmlUrl: 'https://example.com/html',
};

export const InProgressNew = Template.bind({});
InProgressNew.args = {
  dateSubmitted: '2021-09-01T12:00:10Z',
  dateStarted: null,
  dateFinished: null,
  executionStatus: 'in_progress',
  executionDuration: null,
  htmlHash: null,
  htmlUrl: 'https://example.com/html',
};

export const InProgressExisting = Template.bind({});
InProgressExisting.args = {
  dateSubmitted: '2021-09-01T12:00:00Z',
  dateStarted: '2021-09-01T12:00:01Z',
  dateFinished: '2021-09-01T12:00:10Z',
  executionStatus: 'in_progress',
  executionDuration: 10.12,
  htmlHash: null,
  htmlUrl: 'https://example.com/html',
};
