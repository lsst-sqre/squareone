// next.config.js
// https://nextjs.org/docs/api-reference/next.config.js/introduction

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv').default;

const readYamlConfig = (configPath, schemaPath) => {
  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const ajv = new Ajv({ useDefaults: true, removeAdditional: true });
    const validate = ajv.compile(schema);

    const data = yaml.load(fs.readFileSync(configPath, 'utf8'));
    // Validation modifies the configuration data by adding defaults and
    // removing additional properties.
    validate(data);

    return data;
  } catch (err) {
    console.error(`Configuration (${configPath}) could not be read.`, err);
    process.exit(1);
  }
};

const readPublicYamlConfig = () => {
  const p = process.env.SQUAREONE_CONFIG_PATH || 'squareone.config.yaml';
  const configPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  console.log(`Public config path: ${configPath}`);

  const schemaPath = path.join(__dirname, 'squareone.config.schema.json');

  const data = readYamlConfig(configPath, schemaPath);
  return data;
};

const readServerYamlConfig = () => {
  const p = process.env.SQUAREONE_CONFIG_PATH || 'squareone.serverconfig.yaml';
  const configPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  console.log(`Server config path: ${configPath}`);

  const schemaPath = path.join(__dirname, 'squareone.serverconfig.schema.json');

  const data = readYamlConfig(configPath, schemaPath);
  return data;
};

module.exports = (phase, { defaultConfig }) => {
  console.log(`Read config in ${phase}`);

  const publicYamlConfig = readPublicYamlConfig();
  const serverYamlConfig = readServerYamlConfig();

  const config = {
    ...defaultConfig,
    publicRuntimeConfig: { ...publicYamlConfig },
    serverRuntimeConfig: { ...serverYamlConfig },
    async rewrites() {
      return [
        {
          source: '/auth/api/v1/user-info',
          destination: '/api/dev/user-info',
        },
      ];
    },
  };
  console.log(config);
  return config;
};
