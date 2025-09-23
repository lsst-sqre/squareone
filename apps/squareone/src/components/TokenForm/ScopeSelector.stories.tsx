import ScopeSelector from './ScopeSelector';
import type { Scope } from './ScopeSelector';

const mockScopes: Scope[] = [
  {
    name: 'read:all',
    description: 'Read access to all services',
  },
  {
    name: 'user:token',
    description: 'Can create and modify user tokens',
  },
  {
    name: 'admin:token',
    description: 'Can create and manage all tokens',
  },
  {
    name: 'exec:notebook',
    description: 'Can execute notebooks',
  },
  {
    name: 'exec:portal',
    description: 'Can access the science portal',
  },
];

export default {
  title: 'TokenForm/ScopeSelector',
  component: ScopeSelector,
};

export const Default = () => (
  <ScopeSelector
    scopes={mockScopes}
    selectedScopes={[]}
    onChange={() => {}}
    name="scopes"
    disabled={false}
  />
);

export const SomeSelected = () => (
  <ScopeSelector
    scopes={mockScopes}
    selectedScopes={['read:all', 'user:token']}
    onChange={() => {}}
    name="scopes"
    disabled={false}
  />
);

export const AllSelected = () => (
  <ScopeSelector
    scopes={mockScopes}
    selectedScopes={mockScopes.map((s) => s.name)}
    onChange={() => {}}
    name="scopes"
    disabled={false}
  />
);

export const Disabled = () => (
  <ScopeSelector
    scopes={mockScopes}
    selectedScopes={['read:all']}
    onChange={() => {}}
    name="scopes"
    disabled={true}
  />
);
