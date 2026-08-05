import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotebookExecutionError from './NotebookExecutionError';

const meta = {
  component: NotebookExecutionError,
  title: 'Components/TimesSquare/NotebookExecutionError',
  args: {
    onRerun: () => {},
    isRerunPending: false,
    rerunFailed: false,
  },
} satisfies Meta<typeof NotebookExecutionError>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The API's copy for a notebook that exceeded its execution time limit. */
export const Timeout: Story = {
  args: {
    executionError: {
      code: 'timeout',
      title: 'Notebook execution timed out',
      message:
        'The notebook did not finish executing within the allowed time. Try again, or simplify the notebook so it completes faster.',
    },
  },
};

export const JupyterError: Story = {
  args: {
    executionError: {
      code: 'jupyter_error',
      title: 'The notebook raised an error',
      message:
        'A cell raised an exception while the notebook was executing. Check the notebook source for the failing cell.',
    },
  },
};

export const ResultUnavailable: Story = {
  args: {
    executionError: {
      code: 'result_unavailable',
      title: 'The execution result is unavailable',
      message:
        'Times Square could not retrieve the result of this execution. Re-running usually resolves this.',
    },
  },
};

/** A code added by a newer Times Square gets the generic treatment. */
export const UnrecognizedCode: Story = {
  args: {
    executionError: {
      code: 'a_future_code',
      title: 'The notebook could not be executed',
      message: 'Times Square reported a failure it could not classify.',
    },
  },
};

export const RerunPending: Story = {
  args: {
    ...Timeout.args,
    isRerunPending: true,
  },
};

export const RerunFailed: Story = {
  args: {
    ...Timeout.args,
    rerunFailed: true,
  },
};
