import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['sb-original/image-context'],
  },
  resolve: {
    alias: {
      // Ensure we're using the correct React Vite framework for Storybook
      '@storybook/react-vite': '@storybook/react-vite',
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
});
