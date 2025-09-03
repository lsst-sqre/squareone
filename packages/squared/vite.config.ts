import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

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
});
