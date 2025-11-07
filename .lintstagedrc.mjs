export default {
  '*.{js,jsx,ts,tsx,yaml,yml,json,graphql}': ['prettier --write'],
  '**/Dockerfile*': ['node scripts/validate-docker-versions.js'],
};
