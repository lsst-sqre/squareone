import React from 'react';
import type { TokenChangeHistoryEntry } from '../../hooks/useTokenChangeHistory';
import { TokenHistoryDetails } from './TokenHistoryDetails';

export default {
  title: 'Components/TokenHistory/TokenHistoryDetails',
  component: TokenHistoryDetails,
};

// Base entry for stories
const baseEntry: TokenChangeHistoryEntry = {
  token: 'abc123xyz987def456ghi',
  username: 'testuser',
  token_type: 'user',
  token_name: 'My Test Token',
  parent: null,
  scopes: ['read:tap', 'exec:notebook', 'write:tap'],
  service: null,
  expires: 1710504645, // March 15, 2025
  actor: 'testuser',
  action: 'create',
  old_token_name: null,
  old_scopes: null,
  old_expires: null,
  ip_address: '192.168.1.1',
  event_time: 1709904645, // March 8, 2025
};

// Create action stories
export const CreateAction = {
  args: {
    entry: baseEntry,
  },
};

export const CreateActionWithoutExpiration = {
  args: {
    entry: {
      ...baseEntry,
      expires: null,
    },
  },
};

export const CreateActionWithParent = {
  args: {
    entry: {
      ...baseEntry,
      parent: 'parent123token456xyz',
    },
  },
};

export const CreateActionWithoutIpAddress = {
  args: {
    entry: {
      ...baseEntry,
      ip_address: null,
    },
  },
};

export const CreateActionMinimal = {
  args: {
    entry: {
      ...baseEntry,
      parent: null,
      ip_address: null,
      expires: null,
      scopes: [],
    },
  },
};

// Edit action stories
export const EditActionNameChange = {
  args: {
    entry: {
      ...baseEntry,
      action: 'edit' as const,
      token_name: 'Updated Token Name',
      old_token_name: 'Original Token Name',
      old_scopes: null,
      old_expires: null,
    },
  },
};

export const EditActionExpiresChange = {
  args: {
    entry: {
      ...baseEntry,
      action: 'edit' as const,
      expires: 1711504645, // New date
      old_expires: 1710504645, // Old date
      old_token_name: null,
      old_scopes: null,
    },
  },
};

export const EditActionScopeAdditions = {
  args: {
    entry: {
      ...baseEntry,
      action: 'edit' as const,
      scopes: ['read:tap', 'exec:notebook', 'write:tap', 'admin:users'],
      old_scopes: ['read:tap', 'exec:notebook', 'write:tap'],
      old_token_name: null,
      old_expires: null,
    },
  },
};

export const EditActionScopeRemovals = {
  args: {
    entry: {
      ...baseEntry,
      action: 'edit' as const,
      scopes: ['read:tap'],
      old_scopes: ['read:tap', 'exec:notebook', 'write:tap'],
      old_token_name: null,
      old_expires: null,
    },
  },
};

export const EditActionScopeChanges = {
  args: {
    entry: {
      ...baseEntry,
      action: 'edit' as const,
      scopes: ['read:tap', 'write:tap', 'admin:users'],
      old_scopes: ['read:tap', 'exec:notebook', 'write:tap'],
      old_token_name: null,
      old_expires: null,
    },
  },
};

export const EditActionMultipleChanges = {
  args: {
    entry: {
      ...baseEntry,
      action: 'edit' as const,
      token_name: 'Updated Token Name',
      old_token_name: 'Original Token Name',
      expires: 1711504645,
      old_expires: 1710504645,
      scopes: ['read:tap', 'write:tap', 'admin:users'],
      old_scopes: ['read:tap', 'exec:notebook'],
    },
  },
};

export const EditActionNoChanges = {
  args: {
    entry: {
      ...baseEntry,
      action: 'edit' as const,
      old_token_name: null,
      old_scopes: null,
      old_expires: null,
    },
  },
};

// Revoke action stories
export const RevokeAction = {
  args: {
    entry: {
      ...baseEntry,
      action: 'revoke' as const,
      scopes: [],
    },
  },
};

export const RevokeActionWithParent = {
  args: {
    entry: {
      ...baseEntry,
      action: 'revoke' as const,
      parent: 'parent123token456xyz',
      scopes: [],
    },
  },
};

export const RevokeActionMinimal = {
  args: {
    entry: {
      ...baseEntry,
      action: 'revoke' as const,
      parent: null,
      ip_address: null,
      scopes: [],
    },
  },
};

// Expire action stories
export const ExpireAction = {
  args: {
    entry: {
      ...baseEntry,
      action: 'expire' as const,
      actor: '(system)',
    },
  },
};

export const ExpireActionWithParent = {
  args: {
    entry: {
      ...baseEntry,
      action: 'expire' as const,
      actor: '(system)',
      parent: 'parent123token456xyz',
    },
  },
};

// IP address click interaction
export const WithIpAddressClickHandler = {
  args: {
    entry: baseEntry,
    onIpAddressClick: (ipAddress: string) => {
      alert(`Filter by IP address: ${ipAddress}`);
    },
  },
};

// Edge cases
export const SessionTokenWithoutName = {
  args: {
    entry: {
      ...baseEntry,
      token_type: 'session' as const,
      token_name: null,
    },
  },
};

export const ManyScopes = {
  args: {
    entry: {
      ...baseEntry,
      scopes: [
        'read:tap',
        'write:tap',
        'exec:notebook',
        'admin:users',
        'admin:token',
        'read:all',
        'write:all',
      ],
    },
  },
};

export const LongTokenName = {
  args: {
    entry: {
      ...baseEntry,
      token_name:
        'This is a very long token name that demonstrates how the component handles lengthy text content',
    },
  },
};

// Comparison view with multiple action types
export const AllActionTypes = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3>Create Action</h3>
        <TokenHistoryDetails entry={baseEntry} />
      </div>
      <div>
        <h3>Edit Action</h3>
        <TokenHistoryDetails
          entry={{
            ...baseEntry,
            action: 'edit',
            token_name: 'Updated Token Name',
            old_token_name: 'Original Token Name',
            scopes: ['read:tap', 'write:tap', 'admin:users'],
            old_scopes: ['read:tap', 'exec:notebook'],
          }}
        />
      </div>
      <div>
        <h3>Revoke Action</h3>
        <TokenHistoryDetails
          entry={{
            ...baseEntry,
            action: 'revoke',
            scopes: [],
          }}
        />
      </div>
      <div>
        <h3>Expire Action</h3>
        <TokenHistoryDetails
          entry={{
            ...baseEntry,
            action: 'expire',
            actor: '(system)',
          }}
        />
      </div>
    </div>
  ),
};
