import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import NotebookExecutionError from './NotebookExecutionError';

const baseProps = {
  onRerun: () => {},
  isRerunPending: false,
  rerunFailed: false,
};

function renderPanel(code: string) {
  return render(
    <NotebookExecutionError
      {...baseProps}
      executionError={{
        code,
        title: 'The notebook could not be executed',
        message: 'Times Square reported a failure it could not classify.',
      }}
    />
  );
}

describe('NotebookExecutionError', () => {
  it('renders the API copy for a known code', () => {
    render(
      <NotebookExecutionError
        {...baseProps}
        executionError={{
          code: 'timeout',
          title: 'Notebook execution timed out',
          message: 'The notebook did not finish executing within the time.',
        }}
      />
    );

    expect(
      screen.getByRole('heading', { name: 'Notebook execution timed out' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('The notebook did not finish executing within the time.')
    ).toBeInTheDocument();
  });

  // `code` is API-supplied, so a code that collides with an `Object.prototype`
  // member must still take the generic presentation rather than resolving to an
  // inherited value (which would make the icon undefined and throw on render).
  it.each([
    'constructor',
    'toString',
    'valueOf',
    '__proto__',
  ])('falls back to the generic presentation for the code %s', (code) => {
    const { container } = renderPanel(code);

    expect(
      screen.getByRole('heading', {
        name: 'The notebook could not be executed',
      })
    ).toBeInTheDocument();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('gives a prototype-named code the same presentation as any other unrecognized code', () => {
    const unrecognized = renderPanel('a_future_code');
    const unrecognizedIcon =
      unrecognized.container.querySelector('svg')?.outerHTML;
    unrecognized.unmount();

    const prototypeNamed = renderPanel('constructor');

    expect(prototypeNamed.container.querySelector('svg')?.outerHTML).toBe(
      unrecognizedIcon
    );
  });
});
