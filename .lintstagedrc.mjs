export default {
  '*': ['biome check --write --staged --no-errors-on-unmatched'],
  '**/Dockerfile*': ['node scripts/validate-docker-versions.js'],
};
