module.exports = {
  root: true,
  extends: ['@lsst-sqre/eslint-config', 'plugin:storybook/recommended'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/no-unescaped-entities': 'off',
  },
};
