import eslintConfig from '@lsst-sqre/eslint-config';
import storybook from 'eslint-plugin-storybook';

export default [
  ...eslintConfig,
  ...storybook.configs['flat/recommended'],
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
];
