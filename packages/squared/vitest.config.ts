import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, defineProject } from 'vitest/config';
import storybookTest from '@storybook/addon-vitest/vitest-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    // Move dependency optimization to test-specific deps.optimizer
    deps: {
      optimizer: {
        web: {
          include: [
            '@storybook/components',
            '@storybook/blocks',
            // MDX dependencies are excluded by default in storybookTest plugin
          ],
        },
      },
    },
    projects: [
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
            provider: 'playwright',
            headless: true,
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
          environment: 'jsdom',
        },
      }),
    ],
  },
});
