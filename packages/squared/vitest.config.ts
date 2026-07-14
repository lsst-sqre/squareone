import path from 'node:path';
import { fileURLToPath } from 'node:url';
import storybookTest from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig, defineProject } from 'vitest/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Move dependency optimization to test-specific deps.optimizer
    deps: {
      optimizer: {
        client: {
          include: [
            '@storybook/components',
            '@storybook/blocks',
            // MDX dependencies are excluded by default in storybookTest plugin
          ],
        },
      },
    },
    projects: [
      // Unit testing project with traditional vitest tests
      defineProject({
        test: {
          name: 'unit',
          include: ['src/**/*.test.{ts,tsx}'],
          exclude: ['src/**/*.stories.{ts,tsx}'],
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./src/test-setup.ts'],
          css: {
            modules: {
              classNameStrategy: 'non-scoped',
            },
          },
        },
      }),
      defineProject({
        plugins: [
          storybookTest({
            configDir: path.join(__dirname, '.storybook'),
            storybookScript: 'pnpm storybook --ci --filter @lsst-sqre/squared',
            tags: {
              include: ['test'],
            },
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
          // Preview annotations (including addon-a11y and ./preview) are
          // auto-provisioned by @storybook/addon-vitest since Storybook 10.3,
          // so no setup file / setProjectAnnotations call is needed here.
          environment: 'jsdom',
        },
      }),
    ],
  },
});
