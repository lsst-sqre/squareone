import type { Meta, StoryObj } from '@storybook/react-vite';
import { KeyValueList } from './KeyValueList';
import { Badge } from '../Badge';

const meta: Meta<typeof KeyValueList> = {
  title: 'Components/KeyValueList',
  component: KeyValueList,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default key-value list
export const Default: Story = {
  args: {
    items: [
      { key: 'CPU', value: '4 cores' },
      { key: 'Memory', value: '16 GB' },
      { key: 'Storage', value: '100 GB' },
    ],
  },
};

// Single item
export const SingleItem: Story = {
  args: {
    items: [{ key: 'Status', value: 'Active' }],
  },
};

// Empty list
export const Empty: Story = {
  args: {
    items: [],
  },
};

// Many items to test scrolling and layout
export const WithManyItems: Story = {
  args: {
    items: [
      { key: 'Username', value: 'jsmith' },
      { key: 'Email', value: 'jsmith@example.com' },
      { key: 'Full Name', value: 'John Smith' },
      { key: 'Role', value: 'Administrator' },
      { key: 'Department', value: 'Engineering' },
      { key: 'Location', value: 'San Francisco, CA' },
      { key: 'Phone', value: '+1 (555) 123-4567' },
      { key: 'Employee ID', value: 'EMP-12345' },
      { key: 'Start Date', value: 'January 15, 2020' },
      { key: 'Manager', value: 'Jane Doe' },
    ],
  },
};

// ReactNode values with badges and formatted content
export const WithReactNodeValues: Story = {
  args: {
    items: [
      {
        key: 'Status',
        value: <Badge color="green">Active</Badge>,
      },
      {
        key: 'Priority',
        value: (
          <Badge variant="solid" color="red">
            High
          </Badge>
        ),
      },
      {
        key: 'Type',
        value: (
          <Badge variant="outline" color="blue">
            Feature
          </Badge>
        ),
      },
      {
        key: 'Assignee',
        value: <strong>John Smith</strong>,
      },
    ],
  },
};

// Mixed string and ReactNode values
export const MixedContent: Story = {
  args: {
    items: [
      { key: 'CPU', value: '4 cores' },
      { key: 'Memory', value: '16 GB' },
      {
        key: 'Status',
        value: <Badge color="green">Running</Badge>,
      },
      { key: 'Uptime', value: '45 days, 3 hours' },
      {
        key: 'Environment',
        value: (
          <Badge variant="outline" color="orange">
            Development
          </Badge>
        ),
      },
    ],
  },
};

// Real-world example: Notebook quotas
export const NotebookQuotas: Story = {
  name: 'Example: Notebook Quotas',
  args: {
    items: [
      { key: 'CPU', value: '4 cores' },
      { key: 'Memory', value: '16 GB' },
      { key: 'Storage', value: '100 GB' },
    ],
  },
};

// Real-world example: API rate limits
export const ApiRateLimits: Story = {
  name: 'Example: API Rate Limits',
  args: {
    items: [
      { key: 'datalinker', value: '500 requests' },
      { key: 'hips', value: '2000 requests' },
      { key: 'tap', value: '500 requests' },
      { key: 'vo-cutouts', value: '100 requests' },
    ],
  },
};

// Real-world example: TAP concurrent queries
export const TapConcurrentQueries: Story = {
  name: 'Example: TAP Concurrent Queries',
  args: {
    items: [
      { key: 'qserv', value: '5 concurrent queries' },
      { key: 'postgres', value: '10 concurrent queries' },
    ],
  },
};

// Long values to test wrapping
export const LongValues: Story = {
  args: {
    items: [
      {
        key: 'Description',
        value:
          'This is a very long description that should wrap to multiple lines when the container width is limited. It demonstrates how the component handles lengthy content gracefully.',
      },
      {
        key: 'URL',
        value:
          'https://example.com/very/long/path/to/resource/that/might/need/to/wrap',
      },
      { key: 'Short', value: 'Brief' },
    ],
  },
};

// User profile example with various data types
export const UserProfile: Story = {
  name: 'Example: User Profile',
  args: {
    items: [
      { key: 'Username', value: 'astro-observer' },
      { key: 'Full Name', value: 'Dr. Jane Astronomer' },
      { key: 'Email', value: 'jane.astronomer@example.org' },
      {
        key: 'Account Status',
        value: <Badge color="green">Active</Badge>,
      },
      { key: 'Member Since', value: 'March 2021' },
      {
        key: 'Role',
        value: (
          <Badge variant="outline" color="purple">
            Researcher
          </Badge>
        ),
      },
      { key: 'Institution', value: 'Rubin Observatory' },
      { key: 'UID', value: '501234' },
      { key: 'GID', value: '501234' },
    ],
  },
};

// System information example
export const SystemInformation: Story = {
  name: 'Example: System Information',
  args: {
    items: [
      { key: 'Hostname', value: 'jupyter-hub-01' },
      { key: 'OS', value: 'Ubuntu 22.04 LTS' },
      { key: 'Kernel', value: '5.15.0-91-generic' },
      {
        key: 'Status',
        value: (
          <Badge variant="solid" color="green">
            Operational
          </Badge>
        ),
      },
      { key: 'Uptime', value: '127 days, 14 hours' },
      { key: 'Load Average', value: '0.45, 0.38, 0.42' },
      { key: 'CPU Usage', value: '23%' },
      { key: 'Memory Usage', value: '12.4 GB / 32 GB (38.75%)' },
      { key: 'Disk Usage', value: '456 GB / 1 TB (45.6%)' },
    ],
  },
};

// With custom className
export const WithCustomClassName: Story = {
  args: {
    items: [
      { key: 'CPU', value: '4 cores' },
      { key: 'Memory', value: '16 GB' },
    ],
    className: 'custom-styling',
  },
};

// Complete quotas page example
export const CompleteQuotasExample: Story = {
  name: 'Example: Complete Quotas Page',
  render: () => (
    <div style={{ maxWidth: '600px' }}>
      <h2 style={{ marginBottom: '1rem' }}>Notebooks</h2>
      <p style={{ marginBottom: '1rem', color: 'var(--rsd-color-gray-700)' }}>
        Resources available for JupyterLab servers.
      </p>
      <KeyValueList
        items={[
          { key: 'CPU', value: '4 cores' },
          { key: 'Memory', value: '16 GB' },
        ]}
      />

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Rate limits</h2>
      <p style={{ marginBottom: '1rem', color: 'var(--rsd-color-gray-700)' }}>
        APIs limit the number of requests you can make in a 15 minute window.
        Your request count resets every 15 minutes.
      </p>
      <KeyValueList
        items={[
          { key: 'datalinker', value: '500 requests' },
          { key: 'hips', value: '2000 requests' },
          { key: 'tap', value: '500 requests' },
          { key: 'vo-cutouts', value: '100 requests' },
        ]}
      />

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        Concurrent queries
      </h2>
      <p style={{ marginBottom: '1rem', color: 'var(--rsd-color-gray-700)' }}>
        You can make a limited number of database queries at the same time. If
        you hit this limit, wait for queries to finish before submitting
        additional ones.
      </p>
      <KeyValueList items={[{ key: 'qserv', value: '5 concurrent queries' }]} />
    </div>
  ),
};

// Interactive playground
export const Playground: Story = {
  args: {
    items: [
      { key: 'Key 1', value: 'Value 1' },
      { key: 'Key 2', value: 'Value 2' },
      { key: 'Key 3', value: 'Value 3' },
    ],
  },
};
