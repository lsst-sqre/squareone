import type { Meta, StoryObj } from '@storybook/react-vite';
import { Bell, Home, Settings, User } from 'lucide-react';
import React from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Button } from '../Button';
import Tabs from './Tabs';

const meta: Meta<typeof Tabs> = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A Tabs component for organizing content into multiple panels. Built with Radix UI primitives for accessibility and keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Default Example
export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <Tabs.List>
        <Tabs.Trigger value="tab1">Account</Tabs.Trigger>
        <Tabs.Trigger value="tab2">Password</Tabs.Trigger>
        <Tabs.Trigger value="tab3">Notifications</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab1">
        <h3>Account Settings</h3>
        <p>Manage your account settings and preferences here.</p>
      </Tabs.Content>
      <Tabs.Content value="tab2">
        <h3>Password Settings</h3>
        <p>Change your password and security settings.</p>
      </Tabs.Content>
      <Tabs.Content value="tab3">
        <h3>Notification Settings</h3>
        <p>Configure how you receive notifications.</p>
      </Tabs.Content>
    </Tabs>
  ),
};

// Controlled Example
export const Controlled: Story = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState('overview');

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p>
          Active tab: <strong>{activeTab}</strong>
        </p>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
            <Tabs.Trigger value="reports">Reports</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview">
            <h3>Overview Dashboard</h3>
            <p>View your account overview and recent activity.</p>
          </Tabs.Content>
          <Tabs.Content value="analytics">
            <h3>Analytics</h3>
            <p>Detailed analytics and metrics for your account.</p>
          </Tabs.Content>
          <Tabs.Content value="reports">
            <h3>Reports</h3>
            <p>Generate and view reports.</p>
          </Tabs.Content>
        </Tabs>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button size="sm" onClick={() => setActiveTab('overview')}>
            Go to Overview
          </Button>
          <Button size="sm" onClick={() => setActiveTab('analytics')}>
            Go to Analytics
          </Button>
          <Button size="sm" onClick={() => setActiveTab('reports')}>
            Go to Reports
          </Button>
        </div>
      </div>
    );
  },
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <Tabs defaultValue="home">
      <Tabs.List>
        <Tabs.Trigger value="home">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Home size={16} />
            <span>Home</span>
          </div>
        </Tabs.Trigger>
        <Tabs.Trigger value="profile">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <User size={16} />
            <span>Profile</span>
          </div>
        </Tabs.Trigger>
        <Tabs.Trigger value="settings">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Settings size={16} />
            <span>Settings</span>
          </div>
        </Tabs.Trigger>
        <Tabs.Trigger value="notifications">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Bell size={16} />
            <span>Notifications</span>
          </div>
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="home">
        <h3>Welcome Home</h3>
        <p>Your personalized dashboard and recent activity.</p>
      </Tabs.Content>
      <Tabs.Content value="profile">
        <h3>Your Profile</h3>
        <p>View and edit your profile information.</p>
      </Tabs.Content>
      <Tabs.Content value="settings">
        <h3>Settings</h3>
        <p>Configure your application preferences.</p>
      </Tabs.Content>
      <Tabs.Content value="notifications">
        <h3>Notifications</h3>
        <p>Manage your notification preferences.</p>
      </Tabs.Content>
    </Tabs>
  ),
};

// Disabled Tabs
export const WithDisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="available">
      <Tabs.List>
        <Tabs.Trigger value="available">Available</Tabs.Trigger>
        <Tabs.Trigger value="locked" disabled>
          Locked
        </Tabs.Trigger>
        <Tabs.Trigger value="premium" disabled>
          Premium Only
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="available">
        <h3>Available Content</h3>
        <p>This content is available to all users.</p>
      </Tabs.Content>
      <Tabs.Content value="locked">
        <h3>Locked Content</h3>
        <p>This content is currently locked.</p>
      </Tabs.Content>
      <Tabs.Content value="premium">
        <h3>Premium Content</h3>
        <p>Upgrade to access premium features.</p>
      </Tabs.Content>
    </Tabs>
  ),
};

// Many Tabs (scrolling behavior)
export const ManyTabs: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <Tabs.List>
        {Array.from({ length: 12 }, (_, i) => (
          <Tabs.Trigger key={`tab${i + 1}`} value={`tab${i + 1}`}>
            Tab {i + 1}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {Array.from({ length: 12 }, (_, i) => (
        <Tabs.Content key={`tab${i + 1}`} value={`tab${i + 1}`}>
          <h3>Tab {i + 1} Content</h3>
          <p>This is the content for tab {i + 1}.</p>
        </Tabs.Content>
      ))}
    </Tabs>
  ),
};

// Rich Content Example
export const RichContent: Story = {
  render: () => (
    <Tabs defaultValue="code">
      <Tabs.List>
        <Tabs.Trigger value="code">Code</Tabs.Trigger>
        <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
        <Tabs.Trigger value="docs">Documentation</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="code">
        <pre
          style={{
            background: '#f5f5f5',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto',
          }}
        >
          <code>{`function greeting(name) {
  return \`Hello, \${name}!\`;
}

console.log(greeting('World'));`}</code>
        </pre>
      </Tabs.Content>
      <Tabs.Content value="preview">
        <div
          style={{
            padding: '2rem',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
          }}
        >
          <h2>Hello, World!</h2>
          <p>This is a preview of the rendered output.</p>
        </div>
      </Tabs.Content>
      <Tabs.Content value="docs">
        <div>
          <h3>Documentation</h3>
          <p>
            The <code>greeting</code> function takes a name parameter and
            returns a greeting string.
          </p>
          <h4>Parameters</h4>
          <ul>
            <li>
              <strong>name</strong> (string): The name to greet
            </li>
          </ul>
          <h4>Returns</h4>
          <p>A formatted greeting string</p>
        </div>
      </Tabs.Content>
    </Tabs>
  ),
};

// URL Sync Example (simulated)
export const UrlSyncExample: Story = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState('web');
    const [mockUrl, setMockUrl] = React.useState('/settings/sessions?type=web');

    const handleTabChange = (value: string) => {
      setActiveTab(value);
      setMockUrl(`/settings/sessions?type=${value}`);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            padding: '0.75rem',
            background: '#f5f5f5',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
          }}
        >
          URL: {mockUrl}
        </div>
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <Tabs.List>
            <Tabs.Trigger value="web">Web sessions</Tabs.Trigger>
            <Tabs.Trigger value="notebook">Notebook sessions</Tabs.Trigger>
            <Tabs.Trigger value="internal">Internal tokens</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="web">
            <h3>Web Sessions</h3>
            <p>Active web browser sessions for your account.</p>
          </Tabs.Content>
          <Tabs.Content value="notebook">
            <h3>Notebook Sessions</h3>
            <p>Running Jupyter notebook sessions.</p>
          </Tabs.Content>
          <Tabs.Content value="internal">
            <h3>Internal Tokens</h3>
            <p>System-generated internal authentication tokens.</p>
          </Tabs.Content>
        </Tabs>
      </div>
    );
  },
};

// Interaction Tests
export const InteractionTests: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <Tabs.List>
        <Tabs.Trigger value="tab1">First Tab</Tabs.Trigger>
        <Tabs.Trigger value="tab2">Second Tab</Tabs.Trigger>
        <Tabs.Trigger value="tab3">Third Tab</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab1">Content 1</Tabs.Content>
      <Tabs.Content value="tab2">Content 2</Tabs.Content>
      <Tabs.Content value="tab3">Content 3</Tabs.Content>
    </Tabs>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Test initial state
    const tab1 = canvas.getByRole('tab', { name: 'First Tab' });
    const tab2 = canvas.getByRole('tab', { name: 'Second Tab' });
    const tab3 = canvas.getByRole('tab', { name: 'Third Tab' });

    expect(tab1).toHaveAttribute('data-state', 'active');
    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab2).toHaveAttribute('data-state', 'inactive');
    expect(tab2).toHaveAttribute('aria-selected', 'false');

    // Test initial content visibility
    expect(canvas.getByText('Content 1')).toBeInTheDocument();
    // Content 2 should not be in document (Radix removes inactive content)
    expect(canvas.queryByText('Content 2')).not.toBeInTheDocument();

    // Test clicking second tab
    await userEvent.click(tab2);
    expect(tab2).toHaveAttribute('data-state', 'active');
    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(tab1).toHaveAttribute('data-state', 'inactive');
    expect(canvas.getByText('Content 2')).toBeInTheDocument();
    expect(canvas.queryByText('Content 1')).not.toBeInTheDocument();

    // Test clicking third tab
    await userEvent.click(tab3);
    expect(tab3).toHaveAttribute('data-state', 'active');
    expect(canvas.getByText('Content 3')).toBeInTheDocument();
    expect(canvas.queryByText('Content 2')).not.toBeInTheDocument();
  },
};

// Keyboard Navigation Test
export const KeyboardNavigationTest: Story = {
  render: () => (
    <div>
      <p style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
        Test keyboard interactions: Tab to focus, Arrow keys to navigate, Home
        for first tab, End for last tab
      </p>
      <Tabs defaultValue="tab1">
        <Tabs.List>
          <Tabs.Trigger value="tab1">First</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Second</Tabs.Trigger>
          <Tabs.Trigger value="tab3">Third</Tabs.Trigger>
          <Tabs.Trigger value="tab4">Fourth</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">First tab content</Tabs.Content>
        <Tabs.Content value="tab2">Second tab content</Tabs.Content>
        <Tabs.Content value="tab3">Third tab content</Tabs.Content>
        <Tabs.Content value="tab4">Fourth tab content</Tabs.Content>
      </Tabs>
    </div>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const tabs = canvas.getAllByRole('tab');

    // Tab to focus first tab
    await userEvent.tab();
    expect(document.activeElement).toBe(tabs[0]);

    // Arrow Right to second tab
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1]).toHaveAttribute('data-state', 'active');
    expect(canvas.getByText('Second tab content')).toBeInTheDocument();

    // Arrow Right to third tab
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(tabs[2]);
    expect(tabs[2]).toHaveAttribute('data-state', 'active');

    // Arrow Left back to second tab
    await userEvent.keyboard('{ArrowLeft}');
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1]).toHaveAttribute('data-state', 'active');

    // End key to last tab
    await userEvent.keyboard('{End}');
    expect(document.activeElement).toBe(tabs[3]);
    expect(tabs[3]).toHaveAttribute('data-state', 'active');
    expect(canvas.getByText('Fourth tab content')).toBeInTheDocument();

    // Home key to first tab
    await userEvent.keyboard('{Home}');
    expect(document.activeElement).toBe(tabs[0]);
    expect(tabs[0]).toHaveAttribute('data-state', 'active');
    expect(canvas.getByText('First tab content')).toBeInTheDocument();
  },
};

// Accessibility Test
export const AccessibilityTest: Story = {
  render: () => (
    <Tabs defaultValue="tab1">
      <Tabs.List aria-label="Settings navigation">
        <Tabs.Trigger value="tab1">General</Tabs.Trigger>
        <Tabs.Trigger value="tab2">Privacy</Tabs.Trigger>
        <Tabs.Trigger value="tab3">Security</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="tab1">
        <h3>General Settings</h3>
        <p>Configure general application settings.</p>
      </Tabs.Content>
      <Tabs.Content value="tab2">
        <h3>Privacy Settings</h3>
        <p>Manage your privacy preferences.</p>
      </Tabs.Content>
      <Tabs.Content value="tab3">
        <h3>Security Settings</h3>
        <p>Update security and authentication settings.</p>
      </Tabs.Content>
    </Tabs>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);

    // Test tablist has proper role and aria-label
    const tablist = canvas.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
    expect(tablist).toHaveAttribute('aria-label', 'Settings navigation');

    // Test tabs have proper ARIA attributes
    const tabs = canvas.getAllByRole('tab');
    expect(tabs).toHaveLength(3);

    tabs.forEach((tab, index) => {
      expect(tab).toHaveAttribute('role', 'tab');
      expect(tab).toHaveAttribute('aria-selected');
      expect(tab).toHaveAttribute('aria-controls');
      expect(tab).toHaveAttribute('data-state');

      if (index === 0) {
        expect(tab).toHaveAttribute('aria-selected', 'true');
        expect(tab).toHaveAttribute('data-state', 'active');
      } else {
        expect(tab).toHaveAttribute('aria-selected', 'false');
        expect(tab).toHaveAttribute('data-state', 'inactive');
      }
    });

    // Test tab panels have proper attributes
    const panel1 = canvas.getByRole('tabpanel');
    expect(panel1).toHaveAttribute('role', 'tabpanel');
    expect(panel1).toHaveAttribute('aria-labelledby');
    expect(panel1).toHaveAttribute('data-state', 'active');

    // Verify content association
    expect(panel1).toContainElement(
      canvas.getByText('Configure general application settings.')
    );
  },
};

// Disabled Tab Test
export const DisabledTabTest: Story = {
  render: () => (
    <Tabs defaultValue="enabled1">
      <Tabs.List>
        <Tabs.Trigger value="enabled1">Enabled 1</Tabs.Trigger>
        <Tabs.Trigger value="disabled" disabled>
          Disabled
        </Tabs.Trigger>
        <Tabs.Trigger value="enabled2">Enabled 2</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="enabled1">First enabled tab</Tabs.Content>
      <Tabs.Content value="disabled">Disabled tab content</Tabs.Content>
      <Tabs.Content value="enabled2">Second enabled tab</Tabs.Content>
    </Tabs>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const disabledTab = canvas.getByRole('tab', { name: 'Disabled' });

    // Test disabled tab has proper attributes
    expect(disabledTab).toHaveAttribute('data-disabled');
    expect(disabledTab).toHaveAttribute('disabled');

    // Test clicking disabled tab doesn't activate it
    await userEvent.click(disabledTab);
    expect(disabledTab).toHaveAttribute('data-state', 'inactive');
    expect(canvas.getByText('First enabled tab')).toBeInTheDocument();
  },
};
