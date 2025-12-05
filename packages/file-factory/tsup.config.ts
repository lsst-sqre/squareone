import { defineConfig } from 'tsup';

export default defineConfig([
  // Main library and config exports
  {
    entry: {
      index: 'src/index.ts',
      'config/index': 'src/config/index.ts',
    },
    format: ['esm'],
    dts: true,
    clean: true,
    splitting: true,
    sourcemap: true,
    target: 'node18',
  },
  // CLI entry point with shebang
  {
    entry: {
      cli: 'src/cli.ts',
    },
    format: ['esm'],
    dts: false,
    clean: false,
    sourcemap: true,
    target: 'node18',
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
