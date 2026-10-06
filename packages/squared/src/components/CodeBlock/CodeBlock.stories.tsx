import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, spyOn, userEvent, waitFor, within } from 'storybook/test';
import CodeBlock from './CodeBlock';
import { getHighlightPassCount, scheduleHighlight } from './highlightScheduler';

const jsonSample = `{
  "applications": ["gafaelfawr", "nublado", "times-square"],
  "datasets": {
    "dp1": {
      "description": "Data Preview 1",
      "services": {
        "tap": "https://data.lsst.cloud/api/tap"
      }
    }
  },
  "version": 3,
  "deprecated": false,
  "notes": null
}`;

const yamlSample = `# Squareone public configuration
siteName: Rubin Science Platform
baseUrl: https://data.lsst.cloud
semaphoreUrl: https://data.lsst.cloud/semaphore
timesSquareUrl: null
apiAspectPageMdx: |
  # APIs
  Access the RSP's data with IVOA services.`;

const pythonSample = `from dataclasses import dataclass

from lsst.rsp import get_tap_service


@dataclass
class Query:
    """An ADQL query against the TAP service."""

    adql: str
    max_rows: int = 100


def run(query: Query) -> int:
    # Count the rows the service returns.
    service = get_tap_service("tap")
    results = service.search(query.adql, maxrec=query.max_rows)
    return len(results)`;

const bashSample = `# Install the client and query the service
pip install lsst-rsp
export TOKEN="$(cat ~/.rsp-token)"
curl -H "Authorization: Bearer $TOKEN" \\
  https://data.lsst.cloud/api/tap/tables | head -n 20`;

const longLineSample = `{
  "url": "https://data.lsst.cloud/api/tap/sync?LANG=ADQL&REQUEST=doQuery&QUERY=SELECT+TOP+10+coord_ra,+coord_dec,+objectId+FROM+dp1.Object+WHERE+CONTAINS(POINT('ICRS',+coord_ra,+coord_dec),+CIRCLE('ICRS',+62.0,+-37.0,+0.05))=1",
  "short": true
}`;

/**
 * Count the Custom Highlight API ranges that fall inside a code element.
 */
function countHighlightedRanges(code: Element) {
  let count = 0;
  CSS.highlights.forEach((highlight) => {
    highlight.forEach((range) => {
      if (code.contains(range.startContainer)) count += 1;
    });
  });
  return count;
}

/** Wait until MicroLighter has highlighted a code element. */
async function expectCodeHighlighted(code: Element) {
  await waitFor(() => expect(countHighlightedRanges(code)).toBeGreaterThan(0));
}

/** Assert that MicroLighter highlighted the story's code block. */
async function expectHighlighted(canvasElement: HTMLElement) {
  const code = canvasElement.querySelector('pre > code');
  if (!code) throw new Error('code element not rendered');
  await expectCodeHighlighted(code);
}

/** The line-number gutter: the code block wrapper's aria-hidden child. */
function getGutter(canvasElement: HTMLElement) {
  return canvasElement.querySelector<HTMLElement>(
    '[data-sqr-code-block] > [aria-hidden="true"]'
  );
}

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  parameters: {
    layout: 'padded',
    // Fail the story tests on any accessibility violation.
    a11y: { test: 'error' },
  },
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'select',
      options: ['json', 'yaml', 'python', 'bash'],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '640px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Json: Story = {
  args: {
    code: jsonSample,
    language: 'json',
    ariaLabel: 'Example service discovery JSON',
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
    // The GitHub theme's light background, from the site theme.
    const pre = canvasElement.querySelector('pre') as HTMLElement;
    await expect(getComputedStyle(pre).backgroundColor).toBe(
      'rgb(255, 255, 255)'
    );
  },
};

export const Yaml: Story = {
  args: {
    code: yamlSample,
    language: 'yaml',
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
  },
};

export const Python: Story = {
  args: {
    code: pythonSample,
    language: 'python',
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
  },
};

export const Bash: Story = {
  args: {
    code: bashSample,
    language: 'bash',
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
  },
};

export const WithLineNumbers: Story = {
  args: {
    code: pythonSample,
    language: 'python',
    lineNumbers: true,
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);

    // One number per line, lined up with the code's lines.
    const gutter = getGutter(canvasElement);
    await expect(gutter).toBeVisible();
    const lineCount = pythonSample.split('\n').length;
    await expect(gutter?.textContent?.split('\n')).toHaveLength(lineCount);
    const pre = canvasElement.querySelector('pre') as HTMLElement;
    const gutterStyle = getComputedStyle(gutter as HTMLElement);
    const preStyle = getComputedStyle(pre);
    await expect(gutterStyle.lineHeight).toBe(preStyle.lineHeight);
    await expect(gutterStyle.paddingTop).toBe(preStyle.paddingTop);
    await expect(gutter?.getBoundingClientRect().top).toBe(
      pre.getBoundingClientRect().top
    );

    // Copying takes the code only, never the line-number gutter.
    const writeText = spyOn(navigator.clipboard, 'writeText').mockResolvedValue(
      undefined
    );
    try {
      const copyButton = within(canvasElement).getByRole('button', {
        name: 'Copy code to clipboard',
      });
      await userEvent.click(copyButton);
      await expect(writeText).toHaveBeenCalledWith(pythonSample);
    } finally {
      writeText.mockRestore();
    }
  },
};

export const WithoutLineNumbers: Story = {
  args: {
    code: pythonSample,
    language: 'python',
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
    await expect(getGutter(canvasElement)).toBeNull();
  },
};

export const CopyDisabled: Story = {
  args: {
    code: bashSample,
    language: 'bash',
    copy: false,
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
    await expect(within(canvasElement).queryByRole('button')).toBeNull();
  },
};

export const LongLines: Story = {
  args: {
    code: longLineSample,
    language: 'json',
    lineNumbers: true,
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
    // Long lines scroll inside the block rather than widening the page.
    const pre = canvasElement.querySelector('pre') as HTMLElement;
    await expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth);
  },
};

// Every CodeBlock on a page shares one highlight pass, so a page with many
// blocks is highlighted once rather than once per block.
export const ManyBlocks: Story = {
  args: {
    code: jsonSample,
    language: 'json',
  },
  render: (args) => (
    <>
      <CodeBlock {...args} />
      <CodeBlock code={yamlSample} language="yaml" />
      <CodeBlock code={pythonSample} language="python" lineNumbers />
      <CodeBlock code={bashSample} language="bash" />
    </>
  ),
  play: async ({ canvasElement, mount }) => {
    // Let any pass from an earlier story finish, then count from here.
    await scheduleHighlight();
    const passesBefore = getHighlightPassCount();

    await mount();
    const codes = [...canvasElement.querySelectorAll('pre > code')];
    await expect(codes).toHaveLength(4);
    for (const code of codes) {
      await expectCodeHighlighted(code);
    }
    await expect(getHighlightPassCount()).toBe(passesBefore + 1);
  },
};

// Dark-theme variants pin the toolbar theme global to dark, which sets
// data-theme="dark" on <html>; in docs mode that would flip every story on
// the page, so they stay out of autodocs. The GitHub theme must follow the
// site theme even when the OS (the test browser) prefers light.
export const JsonDark: Story = {
  tags: ['!autodocs'],
  globals: {
    theme: 'dark',
  },
  args: {
    code: jsonSample,
    language: 'json',
    lineNumbers: true,
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
    const pre = canvasElement.querySelector('pre') as HTMLElement;
    await expect(getComputedStyle(pre).backgroundColor).toBe('rgb(13, 17, 23)');
  },
};

export const YamlDark: Story = {
  tags: ['!autodocs'],
  globals: {
    theme: 'dark',
  },
  args: {
    code: yamlSample,
    language: 'yaml',
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
  },
};

export const PythonDark: Story = {
  tags: ['!autodocs'],
  globals: {
    theme: 'dark',
  },
  args: {
    code: pythonSample,
    language: 'python',
    lineNumbers: true,
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
  },
};

export const BashDark: Story = {
  tags: ['!autodocs'],
  globals: {
    theme: 'dark',
  },
  args: {
    code: bashSample,
    language: 'bash',
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
  },
};
