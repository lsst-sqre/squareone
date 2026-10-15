import { mockDiscoveryDataDev } from '@lsst-sqre/repertoire-client';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { buildApplicationLinks } from '../../lib/admin/overview';
import ApplicationsList from './ApplicationsList';

const links = buildApplicationLinks(mockDiscoveryDataDev);

/** The links in the Applications list, in display order. */
function getListedLinks(): HTMLElement[] {
  const list = screen.getByRole('list', { name: 'Applications' });
  return within(list).getAllByRole('link');
}

describe('ApplicationsList', () => {
  test('heads the section "Applications" with a one-line lead', () => {
    render(<ApplicationsList links={links} />);

    const region = screen.getByRole('region', { name: 'Applications' });
    expect(
      within(region).getByRole('heading', { level: 2, name: 'Applications' })
    ).toBeInTheDocument();
    expect(
      within(region).getByText(
        'Phalanx applications enabled in this environment, linking to their documentation.'
      )
    ).toBeInTheDocument();
  });

  test('links every application to its Phalanx documentation page', () => {
    render(<ApplicationsList links={links} />);

    const listed = getListedLinks();
    expect(listed).toHaveLength(41);
    expect(screen.getByRole('link', { name: 'nublado' })).toHaveAttribute(
      'href',
      'https://phalanx.lsst.io/applications/nublado/'
    );
    expect(
      listed.every((link) =>
        link
          .getAttribute('href')
          ?.startsWith('https://phalanx.lsst.io/applications/')
      )
    ).toBe(true);
  });

  test('counts the applications', () => {
    render(<ApplicationsList links={links} />);

    expect(screen.getByText('41 applications')).toBeInTheDocument();
  });

  test('counts a single application in the singular', () => {
    render(<ApplicationsList links={links.slice(0, 1)} />);

    expect(screen.getByText('1 application')).toBeInTheDocument();
  });

  test('lists the applications alphabetically, whatever their order', () => {
    render(<ApplicationsList links={[...links].reverse()} />);

    expect(getListedLinks().map((link) => link.textContent)).toEqual(
      [...mockDiscoveryDataDev.applications].sort()
    );
  });

  test('says so when discovery lists no applications', () => {
    render(<ApplicationsList links={[]} />);

    const region = screen.getByRole('region', { name: 'Applications' });
    expect(
      within(region).getByText('Service discovery lists no applications.')
    ).toBeInTheDocument();
    expect(within(region).queryByRole('list')).not.toBeInTheDocument();
    expect(within(region).queryByText(/\d+ applications?$/)).toBeNull();
  });
});
