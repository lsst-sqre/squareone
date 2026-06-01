import next from 'eslint-config-next/core-web-vitals';
import storybook from 'eslint-plugin-storybook';

export default [
  ...next,
  ...storybook.configs['flat/recommended'],
  {
    rules: {
      'import/no-anonymous-default-export': 'off',
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
      // The React Compiler-era rules from eslint-plugin-react-hooks v6
      // (bundled with eslint-config-next 16) are demoted to warnings to keep
      // the Next.js 16 upgrade focused. Resolving these is tracked as
      // follow-up work.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
];
