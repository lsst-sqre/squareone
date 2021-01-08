// next.config.js
// https://nextjs.org/docs/api-reference/next.config.js/introduction

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const readYamlConfig = () => {
  const configPath = path.join(
    process.cwd(),
    process.env.SQUAREONE_CONFIG_PATH || 'squareone.config.yaml'
  );
  console.log(`Config path: ${configPath}`);

  try {
    const data = yaml.load(fs.readFileSync(configPath, 'utf8'));
    return data;
  } catch (err) {
    console.error(
      `$SQUAREONE_CONFIG_PATH (${configPath}) could not be read`,
      err
    );
    process.exit(1);
  }
};

module.exports = (phase, { defaultConfig }) => {
  console.log(`Read config in ${phase}`);

  const yamlConfig = readYamlConfig();

  const config = {
    ...defaultConfig,
    publicRuntimeConfig: {
      siteName: yamlConfig.siteName || 'Rubin Science Platform',
    },
  };
  console.log(config);
  return config;
};
