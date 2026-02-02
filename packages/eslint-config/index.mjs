import { FlatCompat } from '@eslint/eslintrc';
import turboConfig from 'eslint-config-turbo/flat';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  ...turboConfig,
  ...compat.extends('next'),
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
];
