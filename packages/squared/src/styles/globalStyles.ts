import { createGlobalStyle } from 'styled-components';

import rsdTokens from '@lsst-sqre/rubin-style-dictionary/dist/tokens.css?inline';
import rsdDarkTokens from '@lsst-sqre/rubin-style-dictionary/dist/tokens.dark.css?inline';

// NOTE: I originally wanted to put the base CSS in a separate file, but
// I couldn't get the tsup compiler to import the contents of the CSS from
// the local package; importing from @lsst-sqre/rubin-style-dictionary worked
// fine. The workaround right now is to write that CSS directly into the
// GlobalStyles component. Perhaps in the future we could put this base CSS
// into a separate CSS package and import it from there.

const GlobalStyles = createGlobalStyle`
  /* Design tokens for the Rubin Style Dictionary. */
  ${rsdTokens}
  ${rsdDarkTokens}

  /* Fundamental CSS styles for HTML elements. */

  html {
    box-sizing: border-box;
  }

  /*
  * Inherit border-box sizing from html
  * https://css-tricks.com/inheriting-box-sizing-probably-slightly-better-best-practice/
  */
  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  :root {
    /*
     * Reinforce that we're respecting the user's ability to set a default
     * font size. The rem unit now becomes relative to this.
     * Flexible Typesetting, Tim Brown, ch 2 and 4
     */
    font-size: 1.1rem;
  }

  html,
  body {
  padding: 0;
  margin: 0;
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, Segoe UI,
      Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
      sans-serif;
  line-height: 1.4;
  color: var(--rsd-component-text-color);
  background-color: var(--rsd-component-page-background-color);
  }

  h1,
  h2 {
    color: var(--rsd-component-text-headline-color);
  }
  
  a {
    color: var(--rsd-component-text-link-color);
    text-decoration: none;
  }
  
  a:hover {
    color: var(--rsd-component-text-link-hover-color);
  }
  
  /*
   * Images that can be inverted to accommodate dark themes.
   */
  img.u-invertable-image {
    filter: invert(var(--rsd-component-image-invert));
  }
  
  /*
   * Design token overrides for dark theme.
   */
  [data-theme='dark'] body {
    --rsd-component-image-invert: 100%;
  }
`;

export { GlobalStyles };
