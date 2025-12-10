import { GlobalStyles } from '@lsst-sqre/squared';
import type { Decorator } from '@storybook/nextjs-vite';

// Decorator that applies the global styles to all stories.
export const withGlobalStyles: Decorator = (StoryFn) => {
  return (
    <>
      <GlobalStyles />
      <StoryFn />
    </>
  );
};
