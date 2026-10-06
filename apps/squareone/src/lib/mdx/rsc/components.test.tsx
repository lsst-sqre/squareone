import { render, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Mock the RSC config loader so each test sets the configured repertoireUrl.
vi.mock('../../config/rsc', () => ({
  getStaticConfig: vi.fn(),
}));

// Mock only fetchServiceDiscovery; keep the real mock data from the client.
vi.mock('@lsst-sqre/repertoire-client', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@lsst-sqre/repertoire-client')>();
  return {
    ...actual,
    fetchServiceDiscovery: vi.fn(),
  };
});

import {
  fetchServiceDiscovery,
  mockDiscovery,
} from '@lsst-sqre/repertoire-client';

import { compileMDX } from 'next-mdx-remote/rsc';
import { getStaticConfig } from '../../config/rsc';
import {
  commonMdxComponents,
  DiscoveryApiEndpoints,
  DiscoveryDatasetDocsCards,
  footerMdxComponents,
} from './components';

type AsyncTag = (props: Record<string, unknown>) => Promise<ReactElement>;

/**
 * Render a discovery-backed MDX tag as MDX would, awaiting the async server
 * component to its element first (React Testing Library renders client trees
 * only).
 */
async function renderTag(Tag: AsyncTag, props: Record<string, unknown> = {}) {
  return render(await Tag(props));
}

function renderServiceLinkTag(props: Record<string, unknown>) {
  return renderTag(commonMdxComponents.ServiceLink as AsyncTag, props);
}

function configureDiscovery() {
  vi.mocked(getStaticConfig).mockResolvedValue({
    repertoireUrl: 'https://example.org/repertoire',
  } as Awaited<ReturnType<typeof getStaticConfig>>);
  vi.mocked(fetchServiceDiscovery).mockResolvedValue(mockDiscovery);
}

function configureNoDiscovery() {
  vi.mocked(getStaticConfig).mockResolvedValue(
    {} as Awaited<ReturnType<typeof getStaticConfig>>
  );
}

describe('RSC MDX components: <ServiceLink>', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureDiscovery();
  });

  test('self-closing, links to the discovered URL with it as the link text', async () => {
    await renderServiceLinkTag({ service: 'comanage' });

    const link = screen.getByRole('link', { name: 'https://id.lsst.cloud' });
    expect(link).toHaveAttribute('href', 'https://id.lsst.cloud/');
    expect(fetchServiceDiscovery).toHaveBeenCalledWith(
      'https://example.org/repertoire',
      expect.anything()
    );
  });

  test('passes the children and variant through to the link', async () => {
    await renderServiceLinkTag({
      service: 'comanage',
      variant: 'cta',
      children: 'Manage account settings',
    });

    const link = screen.getByRole('link', {
      name: 'Manage account settings',
    });
    expect(link).toHaveAttribute('href', 'https://id.lsst.cloud/');
    expect(link.className).toMatch(/ctaLink/);
  });

  test('without a repertoireUrl, renders the children as plain text', async () => {
    configureNoDiscovery();

    const { container } = await renderServiceLinkTag({
      service: 'comanage',
      children: 'Account settings',
    });

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(container).toHaveTextContent('Account settings');
    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
  });

  test('is in the common components that MDX pages import from lib/mdx/rsc', async () => {
    const rsc = await import('.');

    expect(rsc.commonMdxComponents.ServiceLink).toBe(
      commonMdxComponents.ServiceLink
    );
  });

  test('is registered for the footer MDX too', () => {
    expect(footerMdxComponents.ServiceLink).toBe(
      commonMdxComponents.ServiceLink
    );
  });
});

describe('RSC MDX components: <ApiEndpoints>', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureDiscovery();
  });

  test('lists the discovered datasets, forwarding headingLevel', async () => {
    await renderTag(DiscoveryApiEndpoints as AsyncTag, { headingLevel: 4 });

    expect(
      screen.getByRole('heading', { level: 4, name: 'Data Preview 1' })
    ).toBeInTheDocument();
    expect(fetchServiceDiscovery).toHaveBeenCalledWith(
      'https://example.org/repertoire',
      expect.anything()
    );
  });

  test('without a repertoireUrl, renders nothing and skips discovery', async () => {
    configureNoDiscovery();

    const { container } = await renderTag(DiscoveryApiEndpoints as AsyncTag);

    expect(container).toBeEmptyDOMElement();
    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
  });
});

describe('RSC MDX components: <DatasetDocsCards>', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureDiscovery();
  });

  test('renders the children heading and a card per dataset, forwarding headingLevel', async () => {
    await renderTag(DiscoveryDatasetDocsCards as AsyncTag, {
      headingLevel: 4,
      children: <h2>Data previews</h2>,
    });

    expect(
      screen.getByRole('heading', { level: 2, name: 'Data previews' })
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByRole('heading', { level: 4 })
        .map((heading) => heading.textContent)
    ).toEqual([
      'Data Preview 2',
      'Prompt Products',
      'Data Preview 1',
      'Data Preview 0.3',
      'Data Preview 0.2',
    ]);
    expect(fetchServiceDiscovery).toHaveBeenCalledWith(
      'https://example.org/repertoire',
      expect.anything()
    );
  });

  test('without a repertoireUrl, renders nothing (not even the children) and skips discovery', async () => {
    configureNoDiscovery();

    const { container } = await renderTag(
      DiscoveryDatasetDocsCards as AsyncTag,
      { children: <h2>Data previews</h2> }
    );

    expect(container).toBeEmptyDOMElement();
    expect(fetchServiceDiscovery).not.toHaveBeenCalled();
  });
});

describe('RSC MDX components: fenced code blocks (<pre>)', () => {
  // MDX compiles a fenced block to <pre><code class="language-*">, with the
  // block's text (plus a trailing newline) as the code element's children.
  const Pre = commonMdxComponents.pre;

  function getHighlighter(container: HTMLElement) {
    const element = container.querySelector(
      '[data-syntax-theme="github"] micro-lighter'
    );
    if (!element) throw new Error('CodeBlock not rendered');
    return element;
  }

  test('renders a pre with a language-* code child through CodeBlock', () => {
    const { container } = render(
      <Pre>
        <code className="language-json">{'{"name": "squareone"}\n'}</code>
      </Pre>
    );

    expect(getHighlighter(container)).toHaveAttribute('language', 'json');
  });

  test('passes the block text, without the trailing newline, as the code', () => {
    const { container } = render(
      <Pre>
        <code className="language-yaml">{'name: squareone\nversion: 1\n'}</code>
      </Pre>
    );

    expect(
      getHighlighter(container).querySelector('pre > code.language-yaml')
        ?.textContent
    ).toBe('name: squareone\nversion: 1');
  });

  test('shows the copy button but no line numbers', () => {
    const { container } = render(
      <Pre>
        <code className="language-python">{'import pyvo\n'}</code>
      </Pre>
    );

    const highlighter = getHighlighter(container);
    expect(highlighter).toHaveAttribute('controls', 'copy');
    expect(highlighter).not.toHaveAttribute('line-numbers');
  });

  test('renders a pre whose code child has no language-* class as a plain pre', () => {
    const { container } = render(
      <Pre className="custom">
        <code>plain text</code>
      </Pre>
    );

    expect(container.querySelector('micro-lighter')).not.toBeInTheDocument();
    expect(container.innerHTML).toBe(
      '<pre class="custom"><code>plain text</code></pre>'
    );
  });

  test('renders a pre whose language-* child is not a code element as a plain pre', () => {
    const { container } = render(
      <Pre>
        <span className="language-json">{'{}'}</span>
      </Pre>
    );

    expect(container.querySelector('micro-lighter')).not.toBeInTheDocument();
    expect(container.innerHTML).toBe(
      '<pre><span class="language-json">{}</span></pre>'
    );
  });

  test('renders a pre without a code child as a plain pre', () => {
    const { container } = render(<Pre>preformatted text</Pre>);

    expect(container.querySelector('micro-lighter')).not.toBeInTheDocument();
    expect(container.innerHTML).toBe('<pre>preformatted text</pre>');
  });

  test('a fenced code block in MDX content renders through CodeBlock with its language', async () => {
    const { content } = await compileMDX({
      source: '# Example\n\n```json\n{"name": "squareone"}\n```\n',
      components: commonMdxComponents,
    });
    const { container } = render(content);

    const highlighter = getHighlighter(container);
    expect(highlighter).toHaveAttribute('language', 'json');
    expect(highlighter.querySelector('code')?.textContent).toBe(
      '{"name": "squareone"}'
    );
  });

  test('a fenced code block without a language in MDX content renders as a plain pre', async () => {
    const { content } = await compileMDX({
      source: '```\nplain text\n```\n',
      components: commonMdxComponents,
    });
    const { container } = render(content);

    expect(container.querySelector('micro-lighter')).not.toBeInTheDocument();
    expect(container.innerHTML).toBe('<pre><code>plain text\n</code></pre>');
  });
});
