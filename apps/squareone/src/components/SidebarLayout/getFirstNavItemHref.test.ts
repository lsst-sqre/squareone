import { expect, test } from 'vitest';
import { getFirstNavItemHref } from './getFirstNavItemHref';
import type { NavSection } from './SidebarLayout';

test('returns the href of the first item in the first section', () => {
  const navSections: NavSection[] = [
    {
      items: [
        { href: '/admin/sentry', label: 'Sentry' },
        { href: '/admin/other', label: 'Other' },
      ],
    },
  ];

  expect(getFirstNavItemHref(navSections)).toBe('/admin/sentry');
});

test('returns the first item of the first section when several sections exist', () => {
  const navSections: NavSection[] = [
    {
      label: 'First',
      items: [{ href: '/admin/sentry', label: 'Sentry' }],
    },
    {
      label: 'Second',
      items: [{ href: '/admin/other', label: 'Other' }],
    },
  ];

  expect(getFirstNavItemHref(navSections)).toBe('/admin/sentry');
});

test('reordering the nav items changes the resolved href', () => {
  const navSections: NavSection[] = [
    {
      items: [
        { href: '/admin/other', label: 'Other' },
        { href: '/admin/sentry', label: 'Sentry' },
      ],
    },
  ];

  expect(getFirstNavItemHref(navSections)).toBe('/admin/other');
});

test('returns null for an empty nav (no sections)', () => {
  expect(getFirstNavItemHref([])).toBeNull();
});

test('returns null when the first section has no items', () => {
  const navSections: NavSection[] = [{ items: [] }];

  expect(getFirstNavItemHref(navSections)).toBeNull();
});
