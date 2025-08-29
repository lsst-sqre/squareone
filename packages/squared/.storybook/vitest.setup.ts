import { beforeAll, expect } from 'vitest';
import { setProjectAnnotations } from '@storybook/react-vite';
import * as projectAnnotations from './preview';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Apply Storybook configuration to Vitest tests
const annotations = setProjectAnnotations([projectAnnotations]);

// Run before all tests
beforeAll(annotations.beforeAll);
