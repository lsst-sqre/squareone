module.exports = {
  extends: ['next', 'turbo', 'prettier'],
  rules: {},
  settings: {
    react: {
      version: 'detect',
    },
  },
  parserOptions: {
    babelOptions: {
      presets: [require.resolve('next/babel')],
    },
  },
};
