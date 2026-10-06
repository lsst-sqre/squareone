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

``CodeBlock`` wraps MicroLighter's ``<micro-lighter>`` custom element around plain ``<pre><code>`` text.
MicroLighter colours that text with the `CSS Custom Highlight API`_, so the page's HTML stays plain text with no markup around each token.

Highlighting happens only in the browser:

- ``CodeBlock`` is a client component that registers the ``<micro-lighter>`` element after the page hydrates.
  Server components can render it directly; the server-rendered HTML contains the code as plain text.
- Until the element registers, and in browsers without the CSS Custom Highlight API, the code displays as plain monospace text.
  The code stays readable and copyable either way.

The colours come from MicroLighter's GitHub theme, which ``@lsst-sqre/global-css`` imports.
They follow the site's light or dark theme (the ``data-theme`` attribute), not the operating system's colour-scheme preference.

Long lines scroll horizontally inside the block, and the code is keyboard focusable so that keyboard users can scroll it.

See the **Components/CodeBlock** stories in Squared's Storybook_ for examples in each supported style.
