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

/**
 * Wait until MicroLighter has highlighted a code element. The first story to
 * highlight lazy-loads MicroLighter and a grammar, which can take more than
 * waitFor's default second while the rest of the test suite loads too.
 */
async function expectCodeHighlighted(code: Element) {
  await waitFor(() => expect(countHighlightedRanges(code)).toBeGreaterThan(0), {
    timeout: 5000,
  });
}

/** Assert that MicroLighter highlighted the story's code block. */
async function expectHighlighted(canvasElement: HTMLElement) {
  const code = canvasElement.querySelector('pre > code');
  if (!code) throw new Error('code element not rendered');
  await expectCodeHighlighted(code);
}

/** The line-number gutter: the code frame's aria-hidden child. */
function getGutter(canvasElement: HTMLElement) {
  return canvasElement.querySelector<HTMLElement>(
    '[data-sqr-code-block] > [aria-hidden="true"]'
  );
}

/**
 * The parts of a CodeBlock that place its copy button: the code frame (the
 * bordered box around the code), its `<pre>`, and the copy button.
 */
function getCopyLayout(canvasElement: HTMLElement) {
  const frame = canvasElement.querySelector<HTMLElement>(
    '[data-sqr-code-block]'
  );
  const pre = frame?.querySelector('pre');
  if (!frame || !pre) throw new Error('CodeBlock not rendered');
  const button = within(canvasElement).getByRole('button', {
    name: 'Copy code to clipboard',
  });
  return { frame, pre, button };
}

/** Whether two boxes overlap. Boxes that only touch don't overlap. */
function boxesIntersect(a: DOMRect, b: DOMRect) {
  return (
    a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
  );
}

/** Whether the page scrolls horizontally. */
function pageScrollsHorizontally() {
  const root = document.documentElement;
  return root.scrollWidth > root.clientWidth;
}

/**
 * Assert that the copy button sits just outside the block's top-right corner:
 * entirely to the right of the block, top-aligned with it, and in view.
 */
async function expectCopyButtonBeside(canvasElement: HTMLElement) {
  const { frame, pre, button } = getCopyLayout(canvasElement);
  const frameBox = frame.getBoundingClientRect();
  const buttonBox = button.getBoundingClientRect();
  await expect(buttonBox.left).toBeGreaterThanOrEqual(frameBox.right);
  await expect(buttonBox.top).toBeCloseTo(frameBox.top, 0);
  await expect(boxesIntersect(buttonBox, pre.getBoundingClientRect())).toBe(
    false
  );
  // The page margin holds the button, so the page doesn't scroll sideways.
  await expect(buttonBox.right).toBeLessThanOrEqual(
    document.documentElement.clientWidth
  );
  await expect(pageScrollsHorizontally()).toBe(false);
}

/**
 * Assert that the copy button sits above the block's top-right corner, in
 * space the block reserves: entirely above the block and below the content
 * before it (an element with the `lead` test ID).
 */
async function expectCopyButtonAbove(canvasElement: HTMLElement) {
  const { frame, pre, button } = getCopyLayout(canvasElement);
  const lead = within(canvasElement).getByTestId('lead');
  const frameBox = frame.getBoundingClientRect();
  const buttonBox = button.getBoundingClientRect();
  await expect(buttonBox.bottom).toBeLessThanOrEqual(frameBox.top);
  await expect(buttonBox.top).toBeGreaterThanOrEqual(
    lead.getBoundingClientRect().bottom
  );
  await expect(buttonBox.right).toBeCloseTo(frameBox.right, 0);
  // The code's content box starts below the button.
  const contentTop =
    pre.getBoundingClientRect().top +
    Number.parseFloat(getComputedStyle(pre).paddingTop);
  await expect(contentTop).toBeGreaterThan(buttonBox.bottom);
  await expect(pageScrollsHorizontally()).toBe(false);
}

/** A content column like the squareone app's MainContent on wide screens. */
const mainContentColumn = { maxWidth: '60rem', margin: '0 auto' };

const meta: Meta<typeof CodeBlock> = {
  title: 'Components/CodeBlock',
  component: CodeBlock,
  parameters: {
    layout: 'padded',
    // Fail the story tests on any accessibility violation.
    a11y: { test: 'error' },
    viewport: {
      options: {
        // Where squareone's 60rem content column first fits the viewport,
        // edge to edge, with no free margin.
        contentColumnFits: {
          name: 'Content column fits (66rem)',
          styles: { width: '66rem', height: '900px' },
          type: 'desktop',
        },
        // The narrowest viewport with the copy button beside the block.
        copyButtonBeside: {
          name: 'Copy button beside (73rem)',
          styles: { width: '73rem', height: '900px' },
          type: 'desktop',
        },
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'select',
      options: ['json', 'yaml', 'python', 'bash'],
    },
  },
  decorators: [
    // A content column; a story can set its own with the `column` parameter.
    (Story, { parameters }) => (
      <div style={parameters.column ?? { maxWidth: '640px' }}>
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
    const { pre, button } = getCopyLayout(canvasElement);
    await expect(pre.scrollWidth).toBeGreaterThan(pre.clientWidth);
    // The copy button never covers the end of the first line.
    await expect(
      boxesIntersect(
        button.getBoundingClientRect(),
        pre.getBoundingClientRect()
      )
    ).toBe(false);
  },
};

// Wide layouts: the copy button sits in the page margin, just outside the
// block's top-right corner. The story renders at the narrowest viewport that
// uses this placement, in a content column like the squareone app's
// MainContent (60rem wide and centred), so it also checks that the margin
// holds the button without making the page scroll sideways.
export const CopyButtonBeside: Story = {
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    column: mainContentColumn,
  },
  globals: {
    viewport: { value: 'copyButtonBeside', isRotated: false },
  },
  args: {
    code: longLineSample,
    language: 'json',
    lineNumbers: true,
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
    await expectCopyButtonBeside(canvasElement);
  },
};

/** Render the story's CodeBlock after a lead-in paragraph. */
const renderWithLead: Story['render'] = (args) => (
  <>
    <p data-testid="lead">Query the TAP service directly:</p>
    <CodeBlock {...args} />
  </>
);

// Narrow layouts, such as phones: the copy button sits above the block's
// top-right corner, in space the block reserves, so it covers neither the
// code nor the content before the block. Copying swaps the button for its
// "copied" state without moving the code.
export const CopyButtonAbove: Story = {
  tags: ['!autodocs'],
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  args: {
    code: longLineSample,
    language: 'json',
  },
  render: renderWithLead,
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
    await expectCopyButtonAbove(canvasElement);

    // The "copied" state takes the button's place without moving the code.
    const { frame, button } = getCopyLayout(canvasElement);
    const frameTop = frame.getBoundingClientRect().top;
    const { offsetTop, offsetHeight } = button;
    const writeText = spyOn(navigator.clipboard, 'writeText').mockResolvedValue(
      undefined
    );
    try {
      await userEvent.click(button);
      await waitFor(() =>
        expect(within(canvasElement).queryByRole('button')).toBeNull()
      );
      const copied = frame.nextElementSibling as HTMLElement;
      await waitFor(() => expect(copied).toBeVisible());
      await expect(copied.offsetTop).toBe(offsetTop);
      await expect(copied.offsetHeight).toBe(offsetHeight);
      await expect(frame.getBoundingClientRect().top).toBe(frameTop);
    } finally {
      writeText.mockRestore();
    }
  },
};

// Where squareone's content column first fits the viewport it fills it, so
// there's no margin for the copy button: the button stays above the block
// rather than making the page scroll sideways.
export const CopyButtonAboveFullWidthColumn: Story = {
  tags: ['!autodocs'],
  parameters: {
    layout: 'fullscreen',
    column: mainContentColumn,
  },
  globals: {
    viewport: { value: 'contentColumnFits', isRotated: false },
  },
  args: {
    code: longLineSample,
    language: 'json',
  },
  render: renderWithLead,
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
    await expectCopyButtonAbove(canvasElement);
  },
};

// Without a copy button, narrow layouts reserve no space above the block.
export const CopyDisabledNarrow: Story = {
  tags: ['!autodocs'],
  globals: {
    viewport: { value: 'mobile1', isRotated: false },
  },
  args: {
    code: bashSample,
    language: 'bash',
    copy: false,
  },
  play: async ({ canvasElement }) => {
    await expectHighlighted(canvasElement);
    const frame = canvasElement.querySelector(
      '[data-sqr-code-block]'
    ) as HTMLElement;
    const container = frame.parentElement as HTMLElement;
    await expect(frame.getBoundingClientRect().top).toBe(
      container.getBoundingClientRect().top
    );
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
