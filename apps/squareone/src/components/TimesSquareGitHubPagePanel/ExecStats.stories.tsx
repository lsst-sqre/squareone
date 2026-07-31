import { mockExecutionError } from '@lsst-sqre/times-square-client';
import type { Meta, StoryFn } from '@storybook/nextjs-vite';

import {
  TimesSquareHtmlEventsContext,
  type TimesSquareHtmlEventsContextValue,
} from '../TimesSquareHtmlEventsProvider';
import ExecStats from './ExecStats';

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

const Template: StoryFn<TimesSquareHtmlEventsContextValue> = (args) => (
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
  connectionFailed: false,
  executionError: null,
};

/*
 * A failed run reports `execution_status: 'complete'` with a non-null
 * `execution_error`; the panel summarizes the failure instead of claiming the
 * notebook was computed.
 */
export const Failed = Template.bind({});
Failed.args = {
  ...Default.args,
  executionDuration: 14.2,
  executionError: mockExecutionError,
};

/** A failed run that settled without reporting a finish time. */
export const FailedWithoutFinishTime = Template.bind({});
FailedWithoutFinishTime.args = {
  ...Failed.args,
  dateFinished: null,
  executionDuration: null,
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
  connectionFailed: false,
  executionError: null,
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
  connectionFailed: false,
  executionError: null,
};
