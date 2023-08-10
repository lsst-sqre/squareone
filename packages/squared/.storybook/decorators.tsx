import React from 'react';
import { Decorator } from '@storybook/react';
import { GlobalStyles } from '../src/styles/globalStyles';

// Decorator that applies the styled-components global styles to all stories.
export const withGlobalStyles: Decorator = (StoryFn) => {
  return (
    <>
      <GlobalStyles />
      {StoryFn()}
    </>
  );
};
