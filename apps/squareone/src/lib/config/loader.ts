// Server-side configuration loader with Ajv validation (migrated from next.config.js)
// Using require() for server-side modules to avoid dynamic import issues in production builds
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
// Import serialize dynamically since it's an ES module
let serialize: any;

export interface AppConfig {
  siteName: string;
  baseUrl: string;
  semaphoreUrl?: string;
  plausibleDomain?: string;
  environmentName: string;
  siteDescription: string;
  docsBaseUrl: string;
  timesSquareUrl: string;
  coManageRegistryUrl: string;
  enableAppsMenu: boolean;
  appLinks: Array<{
    label: string;
    href: string;
    internal: boolean;
  }>;
  showPreview: boolean;
  previewLink?: string;
  mdxDir: string; // New: configurable MDX directory
  sentryDsn?: string; // Injected from environment
  sentryTracesSampleRate?: number;
  sentryReplaysSessionSampleRate?: number;
  sentryReplaysOnErrorSampleRate?: number;
  sentryDebug?: boolean;
}

// Migrated from next.config.js - YAML loading with Ajv validation
function readYamlConfig(configPath: string, schemaPath: string): any {
  try {
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const ajv = new Ajv({ useDefaults: true, removeAdditional: true });
    const validate = ajv.compile(schema);

    const data = yaml.load(fs.readFileSync(configPath, 'utf8'));

    // Validation modifies the configuration data by adding defaults and
    // removing additional properties.
    const isValid = validate(data);

    if (!isValid && validate.errors) {
      throw new Error(
        `Configuration validation failed: ${ajv.errorsText(validate.errors)}`
      );
    }

    return data;
  } catch (err) {
    console.error(`Configuration (${configPath}) could not be read.`, err);
    process.exit(1);
  }
}

function readPublicYamlConfig(): any {
  const p = process.env.SQUAREONE_CONFIG_PATH || 'squareone.config.yaml';
  const configPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  console.log(`Reading public squareone config from ${configPath}`);
  const schemaPath = path.join(process.cwd(), 'squareone.config.schema.json');
  return readYamlConfig(configPath, schemaPath);
}

function readServerYamlConfig(): any {
  const p =
    process.env.SQUAREONE_SERVER_CONFIG_PATH || 'squareone.serverconfig.yaml';
  const configPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  console.log(`Reading server-side squareone config from ${configPath}`);
  const schemaPath = path.join(
    process.cwd(),
    'squareone.serverconfig.schema.json'
  );
  return readYamlConfig(configPath, schemaPath);
}

export async function loadAppConfig(): Promise<AppConfig> {
  const publicConfig = readPublicYamlConfig();
  const serverConfig = readServerYamlConfig();
  const sentryDsn = process.env.SENTRY_DSN;

  // Merge configurations (similar to next.config.js logic)
  const config = {
    ...publicConfig,
    ...serverConfig,
  } as AppConfig;

  // Only add sentryDsn if it's defined (avoid Next.js serialization issues with undefined)
  if (sentryDsn) {
    config.sentryDsn = sentryDsn;
  }

  return config;
}

export async function loadMdxContent(
  contentPath: string,
  config?: AppConfig
): Promise<any> {
  // Load config if not provided
  if (!config) {
    config = await loadAppConfig();
  }

  // Resolve MDX directory path
  const mdxDir = path.isAbsolute(config.mdxDir)
    ? config.mdxDir // Production: absolute path
    : path.join(process.cwd(), config.mdxDir); // Development: relative path

  const fullPath = path.join(mdxDir, contentPath);

  // Validate file exists before reading
  if (!fs.existsSync(fullPath)) {
    throw new Error(`MDX file not found: ${fullPath}`);
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Dynamic import for ES module
  if (!serialize) {
    const mdxRemote = await import('next-mdx-remote/serialize');
    serialize = mdxRemote.serialize;
  }

  return await serialize(fileContents);
}

// Convenience function to load both config and MDX content
export async function loadConfigAndMdx(contentPath: string): Promise<{
  config: AppConfig;
  mdxSource: any;
}> {
  const config = await loadAppConfig();
  const mdxSource = await loadMdxContent(contentPath, config);

  return { config, mdxSource };
}
