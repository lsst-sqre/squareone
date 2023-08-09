import React from 'react';
import { Decorator } from '@storybook/react';
import GlobalStyle from '../src/styles/globalStyles';

// Decorator that applies the styled-components global styles to all stories.
export const withGlobalStyles: Decorator = (StoryFn) => {
  return (
    <>
      <GlobalStyle />
      {StoryFn()}
    </>
  );
};
