import {
  createDiscoveryQuery,
  mockDiscovery,
  type ServiceDiscovery,
  type UiService,
} from '@lsst-sqre/repertoire-client';
import { describe, expect, test } from 'vitest';

import { APPS_MENU_SERVICES, deriveAppsMenuItems } from './appsMenuItems';

const query = createDiscoveryQuery(mockDiscovery);

describe('deriveAppsMenuItems', () => {
  test('leads with Times Square when the application is enabled', () => {
    const items = deriveAppsMenuItems({
      query,
      userScopes: ['exec:notebook'],
      appLinks: [],
      timesSquareEnabled: true,
    });

    expect(items).toEqual([
      { label: 'Times Square', href: '/times-square/', internal: true },
    ]);
  });

  test('adds admin tools that declare no scopes for an exec:admin user', () => {
    // Argo CD and Chronograf declare no required_scopes in discovery, so the
    // associated exec:admin scope from APPS_MENU_SERVICES gates them.
    const items = deriveAppsMenuItems({
      query,
      userScopes: ['exec:admin'],
      appLinks: [],
      timesSquareEnabled: true,
    });

    expect(items).toEqual([
      { label: 'Times Square', href: '/times-square/', internal: true },
      {
        label: 'Argo CD',
        href: 'https://data.lsst.cloud/argo-cd',
        internal: false,
      },
      {
        label: 'Chronograf metrics viewer',
        href: 'https://data.lsst.cloud/chronograf',
        internal: false,
      },
    ]);
  });

  test('prefers the scopes discovery declares over the associated scopes', () => {
    // Discovery gates Argo CD on its own scope, replacing exec:admin.
    const argocdScoped = createDiscoveryQuery(
      withUiServices({
        argocd: {
          ...mockDiscovery.services.ui.argocd,
          required_scopes: ['exec:argocd'],
        },
      })
    );

    const labelsFor = (userScopes: string[]) =>
      deriveAppsMenuItems({
        query: argocdScoped,
        userScopes,
        appLinks: [],
        timesSquareEnabled: false,
      }).map((item) => item.label);

    expect(labelsFor(['exec:admin'])).toEqual(['Chronograf metrics viewer']);
    expect(labelsFor(['exec:argocd'])).toEqual(['Argo CD']);
  });

  test('adds Kafdrop for a user holding exec:internal-tools', () => {
    const labels = deriveAppsMenuItems({
      query,
      userScopes: ['exec:admin', 'exec:internal-tools'],
      appLinks: [],
      timesSquareEnabled: true,
    }).map((item) => item.label);

    expect(labels).toEqual([
      'Times Square',
      'Argo CD',
      'Chronograf metrics viewer',
      'Kafdrop Kafka viewer',
    ]);
  });

  test('orders services as APPS_MENU_SERVICES does, not as discovery does', () => {
    const { argocd, chronograf, kafdrop, webdav } = mockDiscovery.services.ui;
    const reversed = createDiscoveryQuery({
      ...mockDiscovery,
      services: {
        ...mockDiscovery.services,
        ui: { webdav, kafdrop, chronograf, argocd },
      },
    });

    const names = deriveAppsMenuItems({
      query: reversed,
      userScopes: ['exec:admin', 'exec:internal-tools', 'write:files'],
      appLinks: [],
      timesSquareEnabled: false,
    }).map((item) => item.href.split('/').pop());

    expect(names).toEqual(['argo-cd', 'chronograf', 'kafdrop', 'files']);
    expect(Object.keys(APPS_MENU_SERVICES)).toEqual([
      'argocd',
      'chronograf',
      'kafdrop',
      'webdav',
    ]);
  });

  test('skips services missing from discovery', () => {
    const withoutArgocd = createDiscoveryQuery(
      withUiServices({ argocd: undefined })
    );

    const labels = deriveAppsMenuItems({
      query: withoutArgocd,
      userScopes: ['exec:admin'],
      appLinks: [],
      timesSquareEnabled: false,
    }).map((item) => item.label);

    expect(labels).toEqual(['Chronograf metrics viewer']);
  });

  test('treats unknown scopes (anonymous or loading) as holding none', () => {
    const items = deriveAppsMenuItems({
      query,
      userScopes: undefined,
      appLinks: [],
      timesSquareEnabled: true,
    });

    expect(items).toEqual([
      { label: 'Times Square', href: '/times-square/', internal: true },
    ]);
  });

  test('labels a service by its name when discovery gives no title', () => {
    const untitled = createDiscoveryQuery(
      withUiServices({
        chronograf: { ...mockDiscovery.services.ui.chronograf, title: null },
      })
    );

    const labels = deriveAppsMenuItems({
      query: untitled,
      userScopes: ['exec:admin'],
      appLinks: [],
      timesSquareEnabled: false,
    }).map((item) => item.label);

    expect(labels).toEqual(['Argo CD', 'chronograf']);
  });

  test('appends configured appLinks after the discovery items', () => {
    const fovQuicklook = {
      label: 'FOV Quicklook',
      href: '/fov-quicklook/',
      internal: false,
    };

    const items = deriveAppsMenuItems({
      query,
      userScopes: ['exec:admin'],
      appLinks: [fovQuicklook],
      timesSquareEnabled: true,
    });

    expect(items.map((item) => item.label)).toEqual([
      'Times Square',
      'Argo CD',
      'Chronograf metrics viewer',
      'FOV Quicklook',
    ]);
    expect(items.at(-1)).toEqual(fovQuicklook);
  });

  test('drops an appLink whose href a discovery item already has', () => {
    const items = deriveAppsMenuItems({
      query,
      userScopes: ['exec:notebook'],
      appLinks: [
        { label: 'Notebook reports', href: '/times-square/', internal: true },
        { label: 'Nightly Digest', href: '/nightlydigest/', internal: false },
      ],
      timesSquareEnabled: true,
    });

    expect(items).toEqual([
      { label: 'Times Square', href: '/times-square/', internal: true },
      { label: 'Nightly Digest', href: '/nightlydigest/', internal: false },
    ]);
  });

  test('matches a relative appLink href to the absolute discovery URL', () => {
    // Phalanx configs list Argo CD as "/argo-cd/"; discovery publishes
    // https://data.lsst.cloud/argo-cd. Relative hrefs resolve against the
    // squareone UI service URL and a trailing slash is ignored.
    const items = deriveAppsMenuItems({
      query,
      userScopes: ['exec:admin'],
      appLinks: [{ label: 'Argo CD', href: '/argo-cd/', internal: false }],
      timesSquareEnabled: false,
    });

    expect(items.map((item) => item.href)).toEqual([
      'https://data.lsst.cloud/argo-cd',
      'https://data.lsst.cloud/chronograf',
    ]);
  });

  test('keeps an appLink the user cannot see as a discovery item', () => {
    // appLinks are additive extras shown to everyone, as before.
    const items = deriveAppsMenuItems({
      query,
      userScopes: ['exec:notebook'],
      appLinks: [{ label: 'Argo CD', href: '/argo-cd/', internal: false }],
      timesSquareEnabled: false,
    });

    expect(items).toEqual([
      { label: 'Argo CD', href: '/argo-cd/', internal: false },
    ]);
  });

  test('lists only appLinks (and no Times Square) without discovery', () => {
    const appLinks = [
      { label: 'Times Square', href: '/times-square/', internal: true },
      { label: 'Argo CD', href: '/argo-cd/', internal: false },
    ];

    const items = deriveAppsMenuItems({
      query: null,
      userScopes: ['exec:admin'],
      appLinks,
      timesSquareEnabled: false,
    });

    expect(items).toEqual(appLinks);
  });
});

/** mockDiscovery with some UI services replaced (or removed, when undefined). */
function withUiServices(
  ui: Record<string, UiService | undefined>
): ServiceDiscovery {
  const merged = { ...mockDiscovery.services.ui, ...ui };
  return {
    ...mockDiscovery,
    services: {
      ...mockDiscovery.services,
      ui: Object.fromEntries(
        Object.entries(merged).filter(
          (entry): entry is [string, UiService] => entry[1] !== undefined
        )
      ),
    },
  };
}
