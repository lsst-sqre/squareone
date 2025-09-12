import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  external: ['react', 'react-dom'],
  sourcemap: true,
  clean: true,
  // Handle CSS modules
  loader: {
    '.css': 'local-css',
  },
  // Don't bundle CSS files - let consumers import them directly
  publicDir: false,
});
