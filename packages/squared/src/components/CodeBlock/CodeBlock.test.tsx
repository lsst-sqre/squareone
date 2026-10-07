import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import CodeBlock from './CodeBlock';
import { CODE_BLOCK_SELECTOR } from './highlightScheduler';

const jsonSample = '{\n  "name": "squareone"\n}';

/** The line-number gutter: the code frame's aria-hidden child. */
function getGutter(container: HTMLElement) {
  return container.querySelector(
    '[data-sqr-code-block] > [aria-hidden="true"]'
  );
}

describe('CodeBlock', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the code as plain text in a pre > code block', () => {
    const { container } = render(
      <CodeBlock code={jsonSample} language="json" />
    );
    const code = container.querySelector('pre > code');
    expect(code).not.toBeNull();
    expect(code?.textContent).toBe(jsonSample);
  });

  it('marks the code with a language-* class', () => {
    const { container } = render(
      <CodeBlock code="name: squareone" language="yaml" />
    );
    expect(container.querySelector('code')).toHaveClass('language-yaml');
  });

  it('renders no micro-lighter custom element', () => {
    const { container } = render(
      <CodeBlock code="print('hi')" language="python" lineNumbers />
    );
    expect(container.querySelector('micro-lighter')).toBeNull();
  });

  it('places its code where the shared highlight pass looks for it', () => {
    const { container } = render(
      <CodeBlock code="print('hi')" language="python" />
    );
    expect([...container.querySelectorAll(CODE_BLOCK_SELECTOR)]).toEqual([
      container.querySelector('code'),
    ]);
  });

  it('shows an icon-only copy button by default', () => {
    render(<CodeBlock code="ls" language="bash" />);
    const button = screen.getByRole('button', {
      name: 'Copy code to clipboard',
    });
    expect(button.querySelector('svg.lucide-clipboard')).not.toBeNull();
    expect(button).toHaveTextContent(/^$/);
  });

  it('renders the copy button after the code frame, outside it', () => {
    // The frame clips its rounded corners with overflow: hidden, so the
    // button sits beside it, later in DOM order, for CSS anchor positioning.
    const { container } = render(<CodeBlock code="ls" language="bash" />);
    const frame = container.querySelector('[data-sqr-code-block]');
    const button = screen.getByRole('button', {
      name: 'Copy code to clipboard',
    });
    expect(frame).not.toBeNull();
    expect(frame?.contains(button)).toBe(false);
    expect(button.parentElement).toBe(frame?.parentElement);
    expect(frame?.nextElementSibling).toBe(button);
  });

  it('omits the copy button when copy is false', () => {
    render(<CodeBlock code="ls" language="bash" copy={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('omits line numbers by default', () => {
    const { container } = render(<CodeBlock code="ls" language="bash" />);
    expect(getGutter(container)).toBeNull();
  });

  it('shows one line number per line of code when lineNumbers is set', () => {
    const { container } = render(
      <CodeBlock code={jsonSample} language="json" lineNumbers />
    );
    expect(getGutter(container)?.textContent).toBe('1\n2\n3');
  });

  it('does not number the empty line after a trailing newline', () => {
    const { container } = render(
      <CodeBlock code={'ls\npwd\n'} language="bash" lineNumbers />
    );
    expect(getGutter(container)?.textContent).toBe('1\n2');
  });

  it('keeps the line numbers out of the code text', () => {
    const { container } = render(
      <CodeBlock code={jsonSample} language="json" lineNumbers />
    );
    expect(container.querySelector('pre')?.textContent).toBe(jsonSample);
  });

  it('applies the GitHub syntax theme to the code frame', () => {
    const { container } = render(<CodeBlock code="{}" language="json" />);
    expect(container.querySelector('pre')?.parentElement).toHaveAttribute(
      'data-syntax-theme',
      'github'
    );
  });

  it('stays plain text without errors when the Highlight API is missing', async () => {
    // jsdom has no CSS Custom Highlight API, like SSR output before
    // hydration or an older browser.
    const consoleError = vi.spyOn(console, 'error');
    const { container } = render(
      <CodeBlock code="{}" language="json" lineNumbers />
    );
    // Let the highlight effect settle.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(container.querySelector('pre > code')?.textContent).toBe('{}');
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('labels the code block with ariaLabel', () => {
    render(
      <CodeBlock code="{}" language="json" ariaLabel="Service discovery" />
    );
    expect(
      screen.getByRole('group', { name: 'Service discovery' })
    ).toBeInTheDocument();
  });

  it('includes the copy button in the labelled group', () => {
    render(
      <CodeBlock code="{}" language="json" ariaLabel="Service discovery" />
    );
    const group = screen.getByRole('group', { name: 'Service discovery' });
    expect(group).toContainElement(
      screen.getByRole('button', { name: 'Copy code to clipboard' })
    );
    expect(group).toContainElement(document.querySelector('pre'));
  });

  it('leaves code that does not scroll out of the tab order', () => {
    // jsdom has no layout, so nothing overflows; the Storybook stories cover
    // long lines, which make the code focusable.
    const { container } = render(<CodeBlock code="{}" language="json" />);
    expect(container.querySelector('pre')).not.toHaveAttribute('tabindex');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <CodeBlock
        code={jsonSample}
        language="json"
        lineNumbers
        ariaLabel="Example JSON"
      />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
