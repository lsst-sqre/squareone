import TokenForm from './TokenForm';
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
  title: 'TokenForm/TokenForm',
  component: TokenForm,
};

export const Default = () => (
  <TokenForm
    availableScopes={mockScopes}
    onSubmit={() => Promise.resolve()}
    onCancel={() => {}}
    isSubmitting={false}
  />
);

export const PrefilledForm = () => (
  <TokenForm
    availableScopes={mockScopes}
    initialValues={{
      name: 'My API Token',
      scopes: ['read:all', 'user:token'],
      expiration: { type: 'preset', value: '7d' },
    }}
    onSubmit={() => Promise.resolve()}
    onCancel={() => {}}
    isSubmitting={false}
  />
);

export const Submitting = () => (
  <TokenForm
    availableScopes={mockScopes}
    initialValues={{
      name: 'Test Token',
      scopes: ['read:all'],
      expiration: { type: 'preset', value: '90d' },
    }}
    onSubmit={() => Promise.resolve()}
    onCancel={() => {}}
    isSubmitting={true}
  />
);
