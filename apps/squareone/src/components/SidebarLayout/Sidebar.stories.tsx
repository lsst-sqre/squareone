import Sidebar from './Sidebar';
import type { NavSection } from './SidebarLayout';

export default {
  title: 'Components/SidebarLayout/Sidebar',
  component: Sidebar,
};

const mockNavSections: NavSection[] = [
  {
    items: [
      { href: '/settings/profile', label: 'Profile' },
      { href: '/settings/tokens', label: 'Access Tokens' },
    ],
  },
  {
    label: 'Security',
    items: [{ href: '/settings/sessions', label: 'Sessions' }],
  },
];

const defaultArgs = {
  title: 'Settings',
  titleHref: '/settings',
  navSections: mockNavSections,
  currentPath: '/settings/profile',
  onNavigate: () => {},
};

export const Default = {
  args: defaultArgs,
};

export const WithoutSectionLabels = {
  args: {
    ...defaultArgs,
    navSections: [
      {
        items: [
          { href: '/item1', label: 'Item 1' },
          { href: '/item2', label: 'Item 2' },
        ],
      },
    ],
  },
};

export const WithCurrentPath = {
  args: {
    ...defaultArgs,
    currentPath: '/settings/sessions',
  },
};
