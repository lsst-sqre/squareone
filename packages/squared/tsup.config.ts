import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  external: ['react', 'react-dom', /\.css$/],
  sourcemap: true,
  clean: true,
  // Don't bundle CSS files - let consumers import them directly
  publicDir: false,
});
