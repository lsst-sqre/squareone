import * as a11yAddonAnnotations from '@storybook/addon-a11y/preview';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as matchers from '@testing-library/jest-dom/matchers';
import { beforeAll, expect } from 'vitest';
import * as projectAnnotations from './preview';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Apply Storybook configuration to Vitest tests
const annotations = setProjectAnnotations([
  a11yAddonAnnotations,
  projectAnnotations,
]);

// Run before all tests
beforeAll(annotations.beforeAll);
