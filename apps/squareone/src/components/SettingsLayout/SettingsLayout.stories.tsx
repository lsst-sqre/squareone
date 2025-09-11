import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { userEvent, within } from 'storybook/test';
import SettingsLayout from './SettingsLayout';
import { AppConfigProvider } from '../../contexts/AppConfigContext';

const meta: Meta<typeof SettingsLayout> = {
  title: 'Components/SettingsLayout',
  component: SettingsLayout,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof SettingsLayout>;

export const DefaultLayout: Story = {
  args: {
    children: (
      <div>
        <h1>Account Settings</h1>
        <p>
          Manage your account information, preferences, and security settings.
        </p>
        <form>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" defaultValue="jsmith" />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" defaultValue="john@example.com" />
          </div>
          <button type="submit">Save Changes</button>
        </form>
      </div>
    ),
  },
};

export const AccountPageActive: Story = {
  args: {
    children: (
      <div>
        <h1>Account</h1>
        <p>
          This demonstrates the Account page with active state in navigation.
        </p>
        <div
          style={{
            padding: '2rem',
            background: '#f9f9f9',
            borderRadius: '8px',
          }}
        >
          <h2>Profile Information</h2>
          <p>Update your basic profile information here.</p>
        </div>
      </div>
    ),
  },
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings',
      },
    },
  },
};

export const AccessTokensPageActive: Story = {
  args: {
    children: (
      <div>
        <h1>Access Tokens</h1>
        <p>
          This demonstrates the Access Tokens page with active state in
          navigation.
        </p>
        <div
          style={{
            padding: '2rem',
            background: '#f9f9f9',
            borderRadius: '8px',
          }}
        >
          <h2>Manage Access Tokens</h2>
          <p>Create and manage access tokens for API access.</p>
          <button type="button">Create New Token</button>
        </div>
      </div>
    ),
  },
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings/tokens',
      },
    },
  },
};

export const SessionsPageActive: Story = {
  args: {
    children: (
      <div>
        <h1>Sessions</h1>
        <p>
          This demonstrates the Sessions page with active state in navigation.
        </p>
        <div
          style={{
            padding: '2rem',
            background: '#f9f9f9',
            borderRadius: '8px',
          }}
        >
          <h2>Active Sessions</h2>
          <p>View and manage your active login sessions.</p>
          <ul>
            <li>Chrome on macOS - Current session</li>
            <li>Firefox on Windows - Last active 2 days ago</li>
          </ul>
        </div>
      </div>
    ),
  },
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings/sessions',
      },
    },
  },
};

export const MobileLayout: Story = {
  args: {
    children: (
      <div>
        <h1>Mobile Settings</h1>
        <p>
          This demonstrates the mobile layout with responsive sidebar
          navigation. The sidebar converts to a mobile menu with hamburger
          toggle.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <h2>Mobile Experience</h2>
          <p>
            On mobile devices, the sidebar navigation is hidden by default and
            can be accessed via the hamburger menu in the header.
          </p>
        </div>
      </div>
    ),
  },
  globals: {
    viewport: { value: 'iphone14' },
  },
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings',
      },
    },
  },
};

export const MobileMenuToggle: Story = {
  args: {
    children: (
      <div>
        <h1>Mobile Menu Demo</h1>
        <p>
          Click the hamburger menu button in the header to toggle the navigation
          sidebar. The menu pushes content down rather than overlaying it.
        </p>
        <div style={{ height: '100vh', padding: '2rem 0' }}>
          <h2>Test Content</h2>
          <p>
            This content demonstrates how the mobile menu pushes content down.
          </p>
        </div>
      </div>
    ),
  },
  globals: {
    viewport: { value: 'iphone14' },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Find and click the mobile menu toggle button
    const menuButton = canvas.getByTestId('mobile-menu-toggle');
    await userEvent.click(menuButton);

    // Wait a moment for animation
    await new Promise((resolve) => setTimeout(resolve, 500));
  },
};

export const ResponsiveBreakpoint: Story = {
  args: {
    children: (
      <div>
        <h1>Responsive Breakpoint Test</h1>
        <p>
          This story demonstrates the responsive behavior at the 60rem (960px)
          breakpoint. Resize your browser window to see the layout change
          between desktop grid and mobile stacking.
        </p>
        <div
          style={{ padding: '2rem', background: '#f0f0f0', margin: '2rem 0' }}
        >
          <h2>Layout Information</h2>
          <ul>
            <li>Desktop (≥60rem): Grid layout with 18rem sidebar + content</li>
            <li>Mobile (&lt;60rem): Vertical stacking with collapsible menu</li>
          </ul>
        </div>
      </div>
    ),
  },
  parameters: {
    viewport: { defaultViewport: 'responsive' },
  },
};

export const LongContent: Story = {
  args: {
    children: (
      <div>
        <h1>Long Content Test</h1>
        <p>
          This story demonstrates how the layout handles long content with
          proper scrolling behavior on both desktop and mobile.
        </p>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{ marginBottom: '2rem' }}>
            <h2>Section {i + 1}</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p>
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt mollit
              anim id est laborum.
            </p>
          </div>
        ))}
      </div>
    ),
  },
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings/tokens',
      },
    },
  },
};

// Mock configurations for testing dynamic features
const configWithSessionsHidden = {
  siteName: 'Rubin Science Platform',
  siteDescription:
    'The Rubin Science Platform (RSP) provides web-based data access and analysis tools.',
  showPreview: true,
  previewLink: 'https://rsp.lsst.io/roadmap.html',
  docsBaseUrl: 'https://rsp.lsst.io',
  enableAppsMenu: false,
  appLinks: [],
  baseUrl: 'http://localhost:3000',
  coManageRegistryUrl: null,
  timesSquareUrl: null,
  environmentName: 'storybook',
  sentryDsn: null,
  semaphoreUrl: null,
  plausibleDomain: null,
  mdxDir: '/mock/mdx',
  settingsSessionsVisible: false,
};

const configWithSessionsVisible = {
  siteName: 'Rubin Science Platform',
  siteDescription:
    'The Rubin Science Platform (RSP) provides web-based data access and analysis tools.',
  showPreview: true,
  previewLink: 'https://rsp.lsst.io/roadmap.html',
  docsBaseUrl: 'https://rsp.lsst.io',
  enableAppsMenu: false,
  appLinks: [],
  baseUrl: 'http://localhost:3000',
  coManageRegistryUrl: null,
  timesSquareUrl: null,
  environmentName: 'storybook',
  sentryDsn: null,
  semaphoreUrl: null,
  plausibleDomain: null,
  mdxDir: '/mock/mdx',
  settingsSessionsVisible: true,
};

// Mock user data for testing user context
const mockUser = {
  username: 'jdoe',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  uid: 12345,
  gid: 12345,
};

// Create a mock for the useGafaelfawrUser hook
const mockUseGafaelfawrUser = (userData: any) => ({
  user: userData,
  isLoading: false,
  isValidating: false,
  isLoggedIn: !!userData,
  error: null,
});

export const SessionsHidden: Story = {
  args: {
    children: (
      <div>
        <h1>Sessions Navigation Hidden</h1>
        <p>
          This story demonstrates dynamic navigation filtering when
          settingsSessionsVisible is set to false. The Sessions section should
          not appear in the sidebar navigation.
        </p>
        <div
          style={{
            padding: '2rem',
            background: '#f9f9f9',
            borderRadius: '8px',
          }}
        >
          <h2>Configuration Test</h2>
          <p>settingsSessionsVisible: false</p>
          <p>
            Expected behavior: Only Account and Access Tokens sections visible
          </p>
        </div>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <AppConfigProvider config={configWithSessionsHidden}>
        <Story />
      </AppConfigProvider>
    ),
  ],
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings',
      },
    },
  },
};

export const SessionsVisible: Story = {
  args: {
    children: (
      <div>
        <h1>Sessions Navigation Visible</h1>
        <p>
          This story demonstrates dynamic navigation when
          settingsSessionsVisible is set to true. The Sessions section should
          appear in the sidebar navigation under Security.
        </p>
        <div
          style={{
            padding: '2rem',
            background: '#f9f9f9',
            borderRadius: '8px',
          }}
        >
          <h2>Configuration Test</h2>
          <p>settingsSessionsVisible: true</p>
          <p>
            Expected behavior: Account, Access Tokens, and Sessions sections
            visible
          </p>
        </div>
      </div>
    ),
  },
  decorators: [
    (Story) => (
      <AppConfigProvider config={configWithSessionsVisible}>
        <Story />
      </AppConfigProvider>
    ),
  ],
  parameters: {
    nextjs: {
      router: {
        pathname: '/settings',
      },
    },
  },
};
