import React from 'react';
import type { Decorator } from '@storybook/nextjs';
import { GlobalStyles } from '@lsst-sqre/squared';

// Decorator that applies the styled-components global styles to all stories.
export const withGlobalStyles: Decorator = (StoryFn) => {
  return (
    <>
      <GlobalStyles />
      <StoryFn />
    </>
  );
};
