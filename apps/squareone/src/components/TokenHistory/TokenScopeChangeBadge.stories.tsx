import { TokenScopeChangeBadge } from './TokenScopeChangeBadge';

export default {
  title: 'Components/TokenHistory/TokenScopeChangeBadge',
  component: TokenScopeChangeBadge,
};

// Added type with various scope colors
export const AddedExecScope = {
  args: {
    type: 'added',
    scope: 'exec:notebook',
  },
};

export const AddedReadScope = {
  args: {
    type: 'added',
    scope: 'read:tap',
  },
};

export const AddedWriteScope = {
  args: {
    type: 'added',
    scope: 'write:tap',
  },
};

export const AddedDefaultScope = {
  args: {
    type: 'added',
    scope: 'admin:something',
  },
};

// Removed type with various scope colors
export const RemovedExecScope = {
  args: {
    type: 'removed',
    scope: 'exec:notebook',
  },
};

export const RemovedReadScope = {
  args: {
    type: 'removed',
    scope: 'read:tap',
  },
};

export const RemovedWriteScope = {
  args: {
    type: 'removed',
    scope: 'write:tap',
  },
};

export const RemovedDefaultScope = {
  args: {
    type: 'removed',
    scope: 'admin:something',
  },
};

// Size variations (with added type for demonstration)
export const SizeSmall = {
  args: {
    type: 'added',
    scope: 'read:tap',
    size: 'sm',
  },
};

export const SizeMedium = {
  args: {
    type: 'added',
    scope: 'read:tap',
    size: 'md',
  },
};

export const SizeLarge = {
  args: {
    type: 'added',
    scope: 'read:tap',
    size: 'lg',
  },
};

// Comparison views
export const AddedVsRemoved = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <TokenScopeChangeBadge type="added" scope="read:tap" />
      <TokenScopeChangeBadge type="removed" scope="write:tap" />
    </div>
  ),
};

export const AllAddedScopes = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <TokenScopeChangeBadge type="added" scope="exec:notebook" />
      <TokenScopeChangeBadge type="added" scope="read:tap" />
      <TokenScopeChangeBadge type="added" scope="write:tap" />
      <TokenScopeChangeBadge type="added" scope="admin:users" />
    </div>
  ),
};

export const AllRemovedScopes = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <TokenScopeChangeBadge type="removed" scope="exec:notebook" />
      <TokenScopeChangeBadge type="removed" scope="read:tap" />
      <TokenScopeChangeBadge type="removed" scope="write:tap" />
      <TokenScopeChangeBadge type="removed" scope="admin:users" />
    </div>
  ),
};

export const AllSizes = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <TokenScopeChangeBadge type="added" scope="read:tap" size="sm" />
      <TokenScopeChangeBadge type="added" scope="read:tap" size="md" />
      <TokenScopeChangeBadge type="added" scope="read:tap" size="lg" />
    </div>
  ),
};

// Realistic edit scenario
export const EditActionExample = {
  render: () => (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
      }}
    >
      <div>Scope changes:</div>
      <TokenScopeChangeBadge type="removed" scope="write:tap" />
      <TokenScopeChangeBadge type="added" scope="read:tap" />
      <TokenScopeChangeBadge type="added" scope="exec:notebook" />
    </div>
  ),
};
