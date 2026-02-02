import eslintConfig from '@lsst-sqre/eslint-config';

export default [
  ...eslintConfig,
  {
    rules: {
      '@next/next/no-html-link-for-pages': 'off',
    },
  },
];
