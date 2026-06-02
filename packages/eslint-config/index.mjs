import next from 'eslint-config-next';
import turboConfig from 'eslint-config-turbo/flat';

export default [
  ...turboConfig,
  ...next,
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
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
