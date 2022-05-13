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
  console.log(`Reading public squareone config from ${configPath}`);
  const schemaPath = path.join(__dirname, 'squareone.config.schema.json');
  const data = readYamlConfig(configPath, schemaPath);
  return data;
};

const readServerYamlConfig = () => {
  const p = process.env.SQUAREONE_CONFIG_PATH || 'squareone.serverconfig.yaml';
  const configPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  console.log(`Reading server-side squareone config from ${configPath}`);
  const schemaPath = path.join(__dirname, 'squareone.serverconfig.schema.json');
  const data = readYamlConfig(configPath, schemaPath);
  return data;
};

module.exports = (phase, { defaultConfig }) => {
  const publicYamlConfig = readPublicYamlConfig();
  const serverYamlConfig = readServerYamlConfig();

  const config = {
    ...defaultConfig,
    publicRuntimeConfig: { ...publicYamlConfig },
    serverRuntimeConfig: { ...serverYamlConfig },
    async rewrites() {
      return [
        // Mock Gafaelfawr (this is never triggered by a production ingress)
        {
          source: '/auth/api/v1/user-info',
          destination: '/api/dev/user-info',
        },
        // Mock Times Square (this is never triggered by a production ingress)
        {
          source: '/times-square/api/v1/pages',
          destination: '/api/dev/times-square/v1/pages',
        },
        {
          source: '/times-square/api/v1/pages/:page/html',
          destination: '/api/dev/times-square/v1/pages/:page/html',
        },
        {
          source: '/times-square/api/v1/pages/:page/htmlstatus',
          destination: '/api/dev/times-square/v1/pages/:page/htmlstatus',
        },
        {
          source: '/times-square/api/v1/pages/:page',
          destination: '/api/dev/times-square/v1/pages/:page',
        },
        {
          source: '/times-square/api/v1/github',
          destination: '/api/dev/times-square/v1/github',
        },
      ];
    },
  };
  return config;
};
