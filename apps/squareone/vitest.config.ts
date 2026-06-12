import path from 'node:path';
import { fileURLToPath } from 'node:url';
import storybookTest from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, defineProject } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  test: {
    projects: [
      // Unit testing project with traditional vitest tests
      defineProject({
        // Mirror the tsconfig "@/*" -> "./src/*" path alias so unit tests can
        // import (and mock) shell components that reference modules via "@/".
        resolve: {
          alias: {
            '@': path.resolve(__dirname, 'src'),
          },
        },
        // The app's tsconfig uses jsx: "preserve" (Next transforms it with the
        // automatic runtime). Match that here so components that use JSX without
        // importing React render under vitest's esbuild transform too.
        esbuild: {
          jsx: 'automatic',
        },
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.stories.{ts,tsx}'],
          environment: 'jsdom',
          setupFiles: ['src/tests/setup.ts'],
          globals: true,
        },
      }),
      // Storybook interaction testing project
      defineProject({
        plugins: [
          storybookTest({
            configDir: path.join(__dirname, '.storybook'),
            storybookScript: 'pnpm storybook --ci --filter squareone',
            tags: {
              include: ['test'],
            },
            // biome-ignore lint/suspicious/noExplicitAny: Vitest loader plugin type is opaque
          }) as any,
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
          environment: 'jsdom',
        },
      }),
    ],
  },
});
