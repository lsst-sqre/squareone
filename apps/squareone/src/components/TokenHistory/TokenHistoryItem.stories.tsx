import type { TokenChangeHistoryEntry } from '@lsst-sqre/gafaelfawr-client';
import { useState } from 'react';

import TokenHistoryItem from './TokenHistoryItem';

export default {
  title: 'Components/TokenHistory/TokenHistoryItem',
  component: TokenHistoryItem,
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

// Uncontrolled mode (default behavior)
export const UncontrolledCollapsed = {
  args: {
    entry: baseEntry,
  },
};

export const UncontrolledWithShowTokenType = {
  args: {
    entry: {
      ...baseEntry,
      token_name: null,
      token_type: 'session' as const,
    },
    showTokenType: true,
  },
};

export const UncontrolledWithoutTokenType = {
  args: {
    entry: {
      ...baseEntry,
      token_name: null,
      token_type: 'session' as const,
    },
    showTokenType: false,
  },
};

// Controlled mode examples
export const ControlledCollapsed = {
  render: () => {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
      <div>
        <p>External controls:</p>
        <button type="button" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Collapse' : 'Expand'} (controlled)
        </button>
        <TokenHistoryItem
          entry={baseEntry}
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
        />
      </div>
    );
  },
};

export const ControlledExpanded = {
  render: () => {
    const [isExpanded, setIsExpanded] = useState(true);
    return (
      <div>
        <p>External controls:</p>
        <button type="button" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? 'Collapse' : 'Expand'} (controlled)
        </button>
        <TokenHistoryItem
          entry={baseEntry}
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
        />
      </div>
    );
  },
};

// Action type stories
export const CreateAction = {
  args: {
    entry: baseEntry,
  },
};

export const EditAction = {
  args: {
    entry: {
      ...baseEntry,
      action: 'edit' as const,
      token_name: 'Updated Token Name',
      old_token_name: 'Original Token Name',
      scopes: ['read:tap', 'write:tap', 'admin:users'],
      old_scopes: ['read:tap', 'exec:notebook'],
    },
  },
};

export const RevokeAction = {
  args: {
    entry: {
      ...baseEntry,
      action: 'revoke' as const,
      scopes: [],
    },
  },
};

export const ExpireAction = {
  args: {
    entry: {
      ...baseEntry,
      action: 'expire' as const,
      actor: '(system)',
    },
  },
};

// Token type variations
export const UserToken = {
  args: {
    entry: baseEntry,
  },
};

export const SessionToken = {
  args: {
    entry: {
      ...baseEntry,
      token_type: 'session' as const,
      token_name: null,
    },
    showTokenType: true,
  },
};

export const NotebookToken = {
  args: {
    entry: {
      ...baseEntry,
      token_type: 'notebook' as const,
      token_name: null,
    },
    showTokenType: true,
  },
};

export const InternalToken = {
  args: {
    entry: {
      ...baseEntry,
      token_type: 'internal' as const,
      token_name: null,
    },
    showTokenType: true,
  },
};

// Edge cases
export const LongTokenName = {
  args: {
    entry: {
      ...baseEntry,
      token_name:
        'This is a very long token name that demonstrates how the component handles lengthy text content that might wrap',
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

export const WithParent = {
  args: {
    entry: {
      ...baseEntry,
      parent: 'parent123token456xyz',
    },
  },
};

export const WithoutIpAddress = {
  args: {
    entry: {
      ...baseEntry,
      ip_address: null,
    },
  },
};

export const WithoutExpiration = {
  args: {
    entry: {
      ...baseEntry,
      expires: null,
    },
  },
};

// Multiple items in a list (to test visual consistency)
export const MultipleItems = {
  render: () => (
    <div
      style={{
        border: '1px solid var(--rsd-color-gray-200)',
        borderRadius: 'var(--sqo-border-radius-1)',
      }}
    >
      <TokenHistoryItem
        entry={{
          ...baseEntry,
          action: 'create',
          event_time: Date.now() / 1000 - 3600 * 2, // 2h ago
        }}
      />
      <TokenHistoryItem
        entry={{
          ...baseEntry,
          action: 'edit',
          token_name: 'Updated Name',
          old_token_name: 'Original Name',
          event_time: Date.now() / 1000 - 3600 * 24, // 1d ago
        }}
      />
      <TokenHistoryItem
        entry={{
          ...baseEntry,
          action: 'revoke',
          scopes: [],
          event_time: Date.now() / 1000 - 3600 * 24 * 3, // 3d ago
        }}
      />
      <TokenHistoryItem
        entry={{
          ...baseEntry,
          action: 'expire',
          actor: '(system)',
          event_time: Date.now() / 1000 - 3600 * 24 * 7, // 7d ago
        }}
      />
    </div>
  ),
};

// Expand/collapse all demonstration
export const ExpandCollapseAll = {
  render: () => {
    const [expandAll, setExpandAll] = useState(false);

    const entries = [
      {
        ...baseEntry,
        action: 'create' as const,
        event_time: Date.now() / 1000 - 3600 * 2,
      },
      {
        ...baseEntry,
        action: 'edit' as const,
        token_name: 'Updated Name',
        old_token_name: 'Original Name',
        event_time: Date.now() / 1000 - 3600 * 24,
      },
      {
        ...baseEntry,
        action: 'revoke' as const,
        scopes: [],
        event_time: Date.now() / 1000 - 3600 * 24 * 3,
      },
    ];

    return (
      <div>
        <div style={{ marginBottom: '16px' }}>
          <button type="button" onClick={() => setExpandAll(!expandAll)}>
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
        <div
          style={{
            border: '1px solid var(--rsd-color-gray-200)',
            borderRadius: 'var(--sqo-border-radius-1)',
          }}
        >
          {entries.map((entry, index) => (
            <TokenHistoryItem
              key={index}
              entry={entry}
              isExpanded={expandAll}
              onToggle={() => setExpandAll(!expandAll)}
            />
          ))}
        </div>
      </div>
    );
  },
};
