import React from 'react';
import { GlobalStyles } from '@lsst-sqre/squared';

// Decorator that applies the styled-components global styles to all stories.
//    <GlobalStyles />
export const withGlobalStyles = (StoryFn) => {
  return (
    <>
      <GlobalStyles />
      {StoryFn()}
    </>
  );
};
