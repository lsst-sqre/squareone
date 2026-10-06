#########
CodeBlock
#########

``CodeBlock`` displays syntax-highlighted source code, such as a JSON document, a YAML configuration, or a Python example.
It's the standard way to show code in Squareone apps: use ``CodeBlock`` rather than a raw ``<pre>`` element whenever a page shows a block of code.
Inline ``<code>`` is still the right choice for short values within a sentence, such as a URL or a token name.

.. code-block:: tsx

   import { CodeBlock } from '@lsst-sqre/squared';

   export default function DiscoveryDocument({ discovery }: Props) {
     return (
       <CodeBlock
         code={JSON.stringify(discovery, null, 2)}
         language="json"
         lineNumbers
         ariaLabel="Service discovery JSON"
       />
     );
   }

In MDX content, fenced code blocks with a language render through ``CodeBlock`` automatically (see :ref:`mdx-code-blocks`).

Props
=====

.. list-table::
   :header-rows: 1

   * - Prop
     - Type
     - Description
   * - ``code``
     - ``string``
     - The source code to display.
   * - ``language``
     - ``string``
     - The language of the code, which selects the syntax grammar (see :ref:`code-block-languages`).
   * - ``lineNumbers``
     - ``boolean``
     - Show a line-number gutter. Default: ``false``.
   * - ``copy``
     - ``boolean``
     - Show a button that copies the code, without line numbers, to the clipboard. Default: ``true``.
   * - ``ariaLabel``
     - ``string``
     - An accessible name for the code block, such as "Service discovery JSON".
       When set, the block is a named group for assistive technology.

.. _code-block-languages:

Languages
=========

``CodeBlock`` highlights code with the grammars that MicroLighter_ bundles:
``assembly``, ``astro``, ``bash``, ``c``, ``cpp``, ``csharp``, ``css``, ``dart``, ``dockerfile``, ``elixir``, ``git-diff``, ``go``, ``graphql``, ``heex``, ``html``, ``ini``, ``java``, ``javascript``, ``json``, ``kotlin``, ``lua``, ``markdown``, ``nginx``, ``objective-c``, ``perl``, ``php``, ``powershell``, ``python``, ``r``, ``ruby``, ``rust``, ``scss``, ``sql``, ``svelte``, ``swift``, ``toml``, ``tsx``, ``typescript``, ``vue``, and ``yaml``.

Common aliases work too: ``js`` and ``jsx`` (JavaScript), ``ts`` (TypeScript), ``sh``, ``shell``, and ``zsh`` (Bash), ``yml`` (YAML), ``md`` (Markdown), ``py`` (Python), ``rb`` (Ruby), ``docker`` (Dockerfile), ``gql`` (GraphQL), and ``sass`` (SCSS).

Each grammar loads on demand the first time a page shows code in that language.
Code in any other language displays as plain monospace text, still with the copy button.

How highlighting works
======================

``CodeBlock`` renders plain ``<pre><code class="language-…">`` markup, and highlights it with MicroLighter's ``highlightAll()`` function.
MicroLighter colours that text with the `CSS Custom Highlight API`_, so the page's HTML stays plain text with no markup around each token.
``CodeBlock`` also renders its own line-number gutter and copy button (Squared's ``ClipboardButton``), so both work without MicroLighter.

Highlighting happens only in the browser:

- ``CodeBlock`` is a client component that highlights its code after the page hydrates, loading MicroLighter with a dynamic import the first time a code block mounts.
  Server components can render it directly; the server-rendered HTML contains the code as plain text.
- Until highlighting runs, and in browsers without the CSS Custom Highlight API, the code displays as plain monospace text.
  The code stays readable and copyable either way.
- If MicroLighter fails to load (for example, a network error while the app is being redeployed), the code stays plain, and the next code block to mount tries to load it again.

Every ``CodeBlock`` on a page shares one highlight pass.
MicroLighter's highlights are page-wide: each ``highlightAll()`` call replaces every registered highlight with the highlights of the code blocks it scans.
So rather than highlighting each block on its own, every ``CodeBlock`` asks a shared scheduler for a pass when it mounts, when its ``code`` or ``language`` changes, and when it unmounts.
Requests made in the same tick, such as from every code block on a newly rendered page, share a single pass that highlights all of the page's code blocks at once, and passes never overlap.
The pass only scans code inside ``CodeBlock`` markup (a wrapper with the ``data-sqr-code-block`` attribute), so other ``<pre><code>`` elements on the page are left alone.

The colours come from MicroLighter's GitHub theme, which ``@lsst-sqre/global-css`` provides as a separate stylesheet, ``dist/syntax.css``.
They follow the site's light or dark theme (the ``data-theme`` attribute), not the operating system's colour-scheme preference.

An app (or Storybook) that renders ``CodeBlock`` must import both global stylesheets, the base stylesheet and the syntax theme, from its root layout:

.. code-block:: tsx

   import '@lsst-sqre/global-css/dist/next.css';
   import '@lsst-sqre/global-css/dist/syntax.css';

Without ``dist/syntax.css``, code displays as plain, uncoloured monospace text.
The theme is kept out of ``dist/next.css`` because Next.js's Turbopack logs a "Parsing CSS source code failed" warning for its ``::highlight()`` rules and keeps them only through error recovery; a separate stylesheet means a parse failure can't affect the base styles.
The squareone app's ``build`` script fails if no stylesheet that ``next build`` emits contains a ``::highlight()`` rule.

Long lines scroll horizontally inside the block, and the code is keyboard focusable so that keyboard users can scroll it.
The line-number gutter stays in place as the code scrolls sideways, and its numbers can't be selected, so copying the code never includes them.

See the **Components/CodeBlock** stories in Squared's Storybook_ for examples in each supported style.
