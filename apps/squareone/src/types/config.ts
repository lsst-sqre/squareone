export type AppLink = {
  href: string;
  label: string;
  internal?: boolean;
};

export type PublicRuntimeConfig = {
  siteName: string;
  siteDescription: string;
  showPreview?: boolean;
  previewLink?: string;
  docsBaseUrl: string;
  enableAppsMenu?: boolean;
  appLinks: AppLink[];
  baseUrl: string;
  coManageRegistryUrl: string | null;
  timesSquareUrl: string | null;
  semaphoreUrl?: string;
  plausibleDomain?: string;
};
