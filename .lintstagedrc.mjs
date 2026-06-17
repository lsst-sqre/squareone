export default {
  '*': ['biome check --write --staged --no-errors-on-unmatched'],
  '*.{yaml,yml}': ['prettier --write'],
  '**/Dockerfile*': [
    'node packages/repo-scripts/src/validate-docker-versions.js',
  ],
};
