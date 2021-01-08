// next.config.js
// https://nextjs.org/docs/api-reference/next.config.js/introduction

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv').default;

const readYamlConfig = () => {
  const configPath = path.join(
    process.cwd(),
    process.env.SQUAREONE_CONFIG_PATH || 'squareone.config.yaml'
  );
  console.log(`Config path: ${configPath}`);

  try {
    const schema = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, 'squareone.config.schema.json'),
        'utf8'
      )
    );
    const ajv = new Ajv({ useDefaults: true, removeAdditional: true });
    const validate = ajv.compile(schema);

    const data = yaml.load(fs.readFileSync(configPath, 'utf8'));
    // Validation modifies the configuration data by adding defaults and
    // removing additional properties.
    validate(data);

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
    publicRuntimeConfig: { ...yamlConfig },
  };
  console.log(config);
  return config;
};
