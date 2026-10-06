import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import CodeBlock from './CodeBlock';

const jsonSample = '{\n  "name": "squareone"\n}';

function getHighlighter(container: HTMLElement) {
  const element = container.querySelector('micro-lighter');
  if (!element) throw new Error('micro-lighter element not rendered');
  return element;
}

describe('CodeBlock', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the code as plain text in a pre > code block', () => {
    const { container } = render(
      <CodeBlock code={jsonSample} language="json" />
    );
    const code = container.querySelector('micro-lighter > pre > code');
    expect(code).not.toBeNull();
    expect(code?.textContent).toBe(jsonSample);
  });

  it('marks the code with a language-* class', () => {
    const { container } = render(
      <CodeBlock code="name: squareone" language="yaml" />
    );
    expect(container.querySelector('code')).toHaveClass('language-yaml');
  });

  it('passes the language to the micro-lighter element', () => {
    const { container } = render(
      <CodeBlock code="print('hi')" language="python" />
    );
    expect(getHighlighter(container)).toHaveAttribute('language', 'python');
  });

  it('shows the copy control by default', () => {
    const { container } = render(<CodeBlock code="ls" language="bash" />);
    expect(getHighlighter(container)).toHaveAttribute('controls', 'copy');
  });

  it('omits the copy control when copy is false', () => {
    const { container } = render(
      <CodeBlock code="ls" language="bash" copy={false} />
    );
    expect(getHighlighter(container)).not.toHaveAttribute('controls');
  });

  it('omits line numbers by default', () => {
    const { container } = render(<CodeBlock code="ls" language="bash" />);
    expect(getHighlighter(container)).not.toHaveAttribute('line-numbers');
  });

  it('enables line numbers when lineNumbers is set', () => {
    const { container } = render(
      <CodeBlock code="ls" language="bash" lineNumbers />
    );
    expect(getHighlighter(container)).toHaveAttribute('line-numbers');
  });

  it('applies the GitHub syntax theme to its wrapper', () => {
    const { container } = render(<CodeBlock code="{}" language="json" />);
    expect(container.firstElementChild).toHaveAttribute(
      'data-syntax-theme',
      'github'
    );
  });

  it('stays plain text without errors when the Highlight API is missing', async () => {
    // jsdom has custom elements but no CSS Custom Highlight API, like SSR
    // output before hydration or an older browser.
    const consoleError = vi.spyOn(console, 'error');
    expect(() =>
      render(<CodeBlock code="{}" language="json" lineNumbers />)
    ).not.toThrow();
    // Let the registration effect settle.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(customElements.get('micro-lighter')).toBeUndefined();
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

  it('lets keyboard users focus the code to scroll long lines', () => {
    const { container } = render(<CodeBlock code="{}" language="json" />);
    expect(container.querySelector('pre')).toHaveAttribute('tabindex', '0');
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
