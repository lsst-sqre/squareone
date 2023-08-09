import { createGlobalStyle } from 'styled-components';

import rsdTokens from '@lsst-sqre/rubin-style-dictionary/dist/tokens.css?inline';
import rsdDarkTokens from '@lsst-sqre/rubin-style-dictionary/dist/tokens.dark.css?inline';
import baseCss from './base.css?inline';

const GlobalStyle = createGlobalStyle`
    ${rsdTokens}
    ${rsdDarkTokens}
    ${baseCss}
`;

export default GlobalStyle;
