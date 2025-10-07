import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from './Badge';

const meta: Meta<typeof Badge> = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'soft', 'outline'],
      description: 'Visual style of the badge',
    },
    color: {
      control: 'select',
      options: [
        'primary',
        'blue',
        'green',
        'orange',
        'purple',
        'red',
        'yellow',
        'gray',
      ],
      description: 'Semantic color of the badge',
    },
    radius: {
      control: 'select',
      options: ['none', '1', 'full'],
      description: 'Corner radius style',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the badge',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default badge (soft variant, primary color)
export const Default: Story = {
  args: {
    children: 'New',
  },
};

// Basic variants
export const Solid: Story = {
  args: {
    children: 'Solid',
    variant: 'solid',
  },
};

export const Soft: Story = {
  args: {
    children: 'Soft',
    variant: 'soft',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

// All variants side by side
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Badge variant="solid">Solid</Badge>
      <Badge variant="soft">Soft</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

// All colors in soft variant
export const Colors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Badge color="primary">Primary</Badge>
      <Badge color="blue">Blue</Badge>
      <Badge color="green">Green</Badge>
      <Badge color="orange">Orange</Badge>
      <Badge color="purple">Purple</Badge>
      <Badge color="red">Red</Badge>
      <Badge color="yellow">Yellow</Badge>
      <Badge color="gray">Gray</Badge>
    </div>
  ),
};

// Complete color × variant matrix
export const AllCombinations: Story = {
  render: () => {
    const colors = [
      'primary',
      'blue',
      'green',
      'orange',
      'purple',
      'red',
      'yellow',
      'gray',
    ] as const;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h3 style={{ marginBottom: '1rem' }}>Solid Variant</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {colors.map((color) => (
              <Badge key={color} variant="solid" color={color}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem' }}>Soft Variant</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {colors.map((color) => (
              <Badge key={color} variant="soft" color={color}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '1rem' }}>Outline Variant</h3>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {colors.map((color) => (
              <Badge key={color} variant="outline" color={color}>
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  },
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

// Radius variations
export const RadiusVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Badge radius="none">No Radius</Badge>
      <Badge radius="1">Regular</Badge>
      <Badge radius="full">Full Round</Badge>
    </div>
  ),
};

// Inline usage examples
export const InlineUsage: Story = {
  render: () => (
    <div
      style={{
        maxWidth: '600px',
        fontSize: '16px',
        lineHeight: '1.5',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <p>
        The Rubin Observatory data processing pipeline is currently{' '}
        <Badge color="green">running</Badge> normally without any issues. All
        systems are operational and data is being processed at the expected
        rate. The badge component integrates seamlessly within paragraph text
        without disrupting the natural flow or line height of the content.
      </p>
      <p>
        Your account has <Badge color="orange">3 pending</Badge> notifications
        that require attention. These notifications include system updates,
        security alerts, and administrative messages. Please review them at your
        earliest convenience to ensure you stay informed about important changes
        to your account and services.
      </p>
      <p>
        This feature is marked as <Badge color="red">deprecated</Badge> and will
        be removed in the next major release. We recommend migrating to the new
        API endpoint as soon as possible. The deprecated functionality will
        continue to work until the end of the support period, but new
        development should use the recommended alternatives.
      </p>
      <p>
        The API is{' '}
        <Badge variant="outline" color="blue">
          v2.0
        </Badge>{' '}
        and fully supported with comprehensive documentation and examples. This
        version includes significant improvements over v1.x, including better
        performance, enhanced security features, and a more intuitive interface
        for developers building applications on the platform.
      </p>
      <p>
        Notice how the badges with different variants maintain consistent line
        spacing. Whether using{' '}
        <Badge variant="solid" color="purple">
          solid
        </Badge>
        ,{' '}
        <Badge variant="soft" color="primary">
          soft
        </Badge>
        , or{' '}
        <Badge variant="outline" color="gray">
          outline
        </Badge>{' '}
        variants, the text flow remains natural and readable throughout the
        entire paragraph.
      </p>
    </div>
  ),
};

// Status examples
export const StatusBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Badge variant="solid" color="green">
        Active
      </Badge>
      <Badge variant="solid" color="orange">
        Pending
      </Badge>
      <Badge variant="solid" color="red">
        Error
      </Badge>
      <Badge variant="solid" color="gray">
        Inactive
      </Badge>
    </div>
  ),
};

// Soft status examples
export const SoftStatusBadges: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Badge color="green">Success</Badge>
      <Badge color="orange">Warning</Badge>
      <Badge color="red">Error</Badge>
      <Badge color="blue">Info</Badge>
      <Badge color="purple">New</Badge>
    </div>
  ),
};

// Different sizes with same color
export const SizeComparison: Story = {
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        alignItems: 'flex-start',
      }}
    >
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Badge size="sm" color="primary">
          Small
        </Badge>
        <Badge size="md" color="primary">
          Medium
        </Badge>
        <Badge size="lg" color="primary">
          Large
        </Badge>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Badge size="sm" variant="solid" color="green">
          Small
        </Badge>
        <Badge size="md" variant="solid" color="green">
          Medium
        </Badge>
        <Badge size="lg" variant="solid" color="green">
          Large
        </Badge>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Badge size="sm" variant="outline" color="red">
          Small
        </Badge>
        <Badge size="md" variant="outline" color="red">
          Medium
        </Badge>
        <Badge size="lg" variant="outline" color="red">
          Large
        </Badge>
      </div>
    </div>
  ),
};

// Mixed usage showcase
export const MixedShowcase: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ marginBottom: '1rem' }}>Product Features</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Badge variant="solid" color="purple">
            New
          </Badge>
          <Badge variant="soft" color="blue">
            Beta
          </Badge>
          <Badge variant="outline" color="orange">
            Preview
          </Badge>
          <Badge variant="soft" color="green">
            Stable
          </Badge>
          <Badge variant="outline" color="red">
            Deprecated
          </Badge>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>System Status</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Badge variant="solid" color="green">
            Operational
          </Badge>
          <Badge variant="solid" color="orange">
            Degraded
          </Badge>
          <Badge variant="solid" color="red">
            Outage
          </Badge>
          <Badge variant="outline" color="gray">
            Maintenance
          </Badge>
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: '1rem' }}>Categories</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Badge radius="full" color="blue">
            Design
          </Badge>
          <Badge radius="full" color="purple">
            Development
          </Badge>
          <Badge radius="full" color="green">
            Marketing
          </Badge>
          <Badge radius="full" color="orange">
            Sales
          </Badge>
        </div>
      </div>
    </div>
  ),
};

// Interactive playground
export const Playground: Story = {
  args: {
    children: 'Badge',
    variant: 'soft',
    color: 'primary',
    radius: '1',
    size: 'md',
  },
};
