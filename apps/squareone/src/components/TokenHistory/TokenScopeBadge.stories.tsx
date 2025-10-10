import { TokenScopeBadge } from './TokenScopeBadge';

export default {
  title: 'Components/TokenHistory/TokenScopeBadge',
  component: TokenScopeBadge,
};

// Scope color variations
export const ExecScope = {
  args: {
    scope: 'exec:notebook',
  },
};

export const ReadScope = {
  args: {
    scope: 'read:tap',
  },
};

export const WriteScope = {
  args: {
    scope: 'write:tap',
  },
};

export const DefaultScope = {
  args: {
    scope: 'admin:something',
  },
};

// Size variations (with read scope for green color)
export const SizeSmall = {
  args: {
    scope: 'read:tap',
    size: 'sm',
  },
};

export const SizeMedium = {
  args: {
    scope: 'read:tap',
    size: 'md',
  },
};

export const SizeLarge = {
  args: {
    scope: 'read:tap',
    size: 'lg',
  },
};

// Variant variations (with exec scope for red color)
export const VariantSoft = {
  args: {
    scope: 'exec:notebook',
    variant: 'soft',
  },
};

export const VariantOutline = {
  args: {
    scope: 'exec:notebook',
    variant: 'outline',
  },
};

export const VariantSolid = {
  args: {
    scope: 'exec:notebook',
    variant: 'solid',
  },
};

// Custom children (extensibility demonstration)
export const WithCustomChildren = {
  args: {
    scope: 'read:tap',
    children: '+ read:tap',
  },
};

export const WithComplexChildren = {
  args: {
    scope: 'exec:notebook',
    children: (
      <>
        <span style={{ marginRight: '4px' }}>−</span>
        exec:notebook
      </>
    ),
  },
};

// All scope types together for comparison
export const AllScopeTypes = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <TokenScopeBadge scope="exec:notebook" />
      <TokenScopeBadge scope="read:tap" />
      <TokenScopeBadge scope="write:tap" />
      <TokenScopeBadge scope="admin:users" />
    </div>
  ),
};

// All sizes together for comparison
export const AllSizes = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <TokenScopeBadge scope="read:tap" size="sm" />
      <TokenScopeBadge scope="read:tap" size="md" />
      <TokenScopeBadge scope="read:tap" size="lg" />
    </div>
  ),
};

// All variants together for comparison
export const AllVariants = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <TokenScopeBadge scope="exec:notebook" variant="soft" />
      <TokenScopeBadge scope="exec:notebook" variant="outline" />
      <TokenScopeBadge scope="exec:notebook" variant="solid" />
    </div>
  ),
};
