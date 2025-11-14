import { GlobalStyles } from '@lsst-sqre/squared';
import type { Decorator } from '@storybook/nextjs-vite';
import React from 'react';

// Decorator that applies the styled-components global styles to all stories.
export const withGlobalStyles: Decorator = (StoryFn) => {
  return (
    <>
      <GlobalStyles />
      <StoryFn />
    </>
  );
};
