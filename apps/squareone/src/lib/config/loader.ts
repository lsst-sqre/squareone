// Server-side configuration loader with Ajv validation (migrated from next.config.js)
// Using require() for server-side modules to avoid dynamic import issues in production builds
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
// Removed serialize - now handled in individual page getServerSideProps

// Caching for production optimization
// In production, config and content files are read once and cached
// In development, caching can be disabled for easier content editing
const ENABLE_CACHING =
  process.env.NODE_ENV === 'production' ||
  process.env.SQUAREONE_ENABLE_CACHING === 'true';

// Module-level caches
let cachedAppConfig: AppConfig | null = null;
const mdxContentCache = new Map<string, string>();
const missingMdxFiles = new Set<string>(); // Track files that don't exist to avoid repeated checks

/**
 * Sentry configuration for client-side initialization.
 * This interface is used both in AppConfig and for injecting Sentry config
 * into the browser via _document.tsx.
 */
export interface SentryConfig {
  dsn?: string;
  environment?: string;
  tracesSampleRate?: number;
  replaysSessionSampleRate?: number;
  replaysOnErrorSampleRate?: number;
  baseUrl?: string;
}

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
  headerLogoUrl?: string;
  headerLogoData?: string;
  headerLogoMimeType?: string;
  headerLogoHeight?: number;
  headerLogoWidth?: number;
  headerLogoAlt?: string;
}

// Migrated from next.config.js - YAML loading with Ajv validation
// biome-ignore lint/suspicious/noExplicitAny: YAML configuration can contain any dynamically-validated structure
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

// biome-ignore lint/suspicious/noExplicitAny: YAML configuration can contain any dynamically-validated structure
function readPublicYamlConfig(): any {
  const p = process.env.SQUAREONE_CONFIG_PATH || 'squareone.config.yaml';
  const configPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
  console.log(`Reading public squareone config from ${configPath}`);
  const schemaPath = path.join(process.cwd(), 'squareone.config.schema.json');
  return readYamlConfig(configPath, schemaPath);
}

// biome-ignore lint/suspicious/noExplicitAny: YAML configuration can contain any dynamically-validated structure
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
  // Return cached config if available and caching is enabled
  if (ENABLE_CACHING && cachedAppConfig) {
    return cachedAppConfig;
  }

  console.log('Loading app configuration from filesystem...');
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

  // Cache the config if caching is enabled
  if (ENABLE_CACHING) {
    cachedAppConfig = config;
    console.log('App configuration cached');
  }

  return config;
}

export async function loadMdxContent(
  contentPath: string,
  config?: AppConfig
): Promise<string> {
  // Load config if not provided
  if (!config) {
    config = await loadAppConfig();
  }

  // Resolve MDX directory path
  const mdxDir = path.isAbsolute(config.mdxDir)
    ? config.mdxDir // Production: absolute path
    : path.join(process.cwd(), config.mdxDir); // Development: relative path

  const fullPath = path.join(mdxDir, contentPath);

  // Create cache key based on the full path
  const cacheKey = fullPath;

  // Return cached content if available and caching is enabled
  if (ENABLE_CACHING && mdxContentCache.has(cacheKey)) {
    const cachedContent = mdxContentCache.get(cacheKey);
    if (cachedContent) {
      return cachedContent;
    }
  }

  // Check if file is known to be missing (avoids repeated filesystem checks)
  if (missingMdxFiles.has(cacheKey)) {
    throw new Error(`MDX file not found: ${fullPath}`);
  }

  // Validate file exists before reading
  if (!fs.existsSync(fullPath)) {
    // Cache the missing file state to avoid repeated checks
    missingMdxFiles.add(cacheKey);
    throw new Error(`MDX file not found: ${fullPath}`);
  }

  console.log('Loading MDX content from filesystem:', fullPath);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Cache the content if caching is enabled
  if (ENABLE_CACHING) {
    mdxContentCache.set(cacheKey, fileContents);
    console.log('MDX content cached', contentPath);
  }

  // Return raw MDX content - serialization will be done in getServerSideProps
  return fileContents;
}

// Convenience function to load both config and raw MDX content
export async function loadConfigAndMdx(contentPath: string): Promise<{
  config: AppConfig;
  mdxContent: string;
}> {
  const config = await loadAppConfig();
  const mdxContent = await loadMdxContent(contentPath, config);

  return { config, mdxContent };
}
