const path = require('path');

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`;

module.exports = {
  // Run js files through next lint
  // FIXME this is not working as a monorepo
  // '*.{js,jsx,ts,tsx}': ['prettier --write', buildEslintCommand],
  '*.{js,jsx,ts,tsx}': ['prettier --write'],
  '*.{yaml,yml,json}': ['prettier --write'],
};
