import { render, screen, within } from '@testing-library/react';
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

  // An alert region should carry only the announced text; focusable content
  // belongs outside it. The panel therefore scopes its alert to the failure
  // copy and leaves the re-run action out of it.
  it('announces the failure copy without enclosing the re-run action', () => {
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

    const alert = screen.getByRole('alert');
    expect(
      within(alert).getByRole('heading', {
        name: 'Notebook execution timed out',
      })
    ).toBeInTheDocument();
    expect(
      within(alert).getByText(
        'The notebook did not finish executing within the time.'
      )
    ).toBeInTheDocument();
    expect(within(alert).queryByRole('button')).toBeNull();
    // The button is still rendered — just outside the live region.
    expect(
      screen.getByRole('button', { name: /re-run notebook/i })
    ).toBeInTheDocument();
  });

  it('announces a failed re-run request as its own alert', () => {
    render(
      <NotebookExecutionError
        {...baseProps}
        rerunFailed
        executionError={{
          code: 'timeout',
          title: 'Notebook execution timed out',
          message: 'The notebook did not finish executing within the time.',
        }}
      />
    );

    const rerunAlert = screen
      .getAllByRole('alert')
      .find((element) =>
        /failed to request a re-run/i.test(element.textContent ?? '')
      );

    expect(rerunAlert).toBeDefined();
    // Its own region rather than a subtree of the failure-copy alert, so the
    // message is announced when the click inserts it.
    expect(rerunAlert?.tagName).toBe('P');
    expect(within(rerunAlert as HTMLElement).queryByRole('heading')).toBeNull();
  });

  // `code` is API-supplied, so a code that collides with an `Object.prototype`
  // member must still take the generic presentation rather than resolving to an
  // inherited value (which would make the icon undefined and throw on render).
  it.each(['constructor', 'toString', 'valueOf', '__proto__'])(
    'falls back to the generic presentation for the code %s',
    (code) => {
      const { container } = renderPanel(code);

      expect(
        screen.getByRole('heading', {
          name: 'The notebook could not be executed',
        })
      ).toBeInTheDocument();
      expect(container.querySelector('svg')).not.toBeNull();
    }
  );

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
