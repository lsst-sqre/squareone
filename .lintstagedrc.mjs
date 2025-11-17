export default {
  '*': ['biome check --write --staged --no-errors-on-unmatched'],
  '*.{yaml,yml}': ['prettier --write'],
  '**/Dockerfile*': ['node scripts/validate-docker-versions.js'],
};
