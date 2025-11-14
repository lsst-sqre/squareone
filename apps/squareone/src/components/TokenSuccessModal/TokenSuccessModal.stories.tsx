import { Button } from '@lsst-sqre/squared';
import type { Meta, StoryObj } from '@storybook/nextjs';
import { useState } from 'react';
import { ExpirationValue } from '../../lib/tokens/expiration';
import TokenSuccessModal from './TokenSuccessModal';

const meta = {
  title: 'Tokens/TokenSuccessModal',
  component: TokenSuccessModal,
  parameters: {
    layout: 'centered',
    nextjs: {
      router: {
        pathname: '/settings/tokens/new',
        asPath: '/settings/tokens/new',
        query: {},
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof TokenSuccessModal>;

export default meta;
type Story = StoryObj<typeof meta>;

const InteractiveWrapper = ({
  token,
  tokenName,
  scopes,
  expiration,
  templateUrl,
}: {
  token: string;
  tokenName: string;
  scopes: string[];
  expiration: ExpirationValue;
  templateUrl: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ padding: '2rem' }}>
      <Button onClick={() => setOpen(true)}>Open Success Modal</Button>
      <TokenSuccessModal
        open={open}
        onClose={() => setOpen(false)}
        token={token}
        tokenName={tokenName}
        scopes={scopes}
        expiration={expiration}
        templateUrl={templateUrl}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => (
    <InteractiveWrapper
      token="gt-1234567890abcdef1234567890abcdef"
      tokenName="My API Token"
      scopes={['read:all', 'user:token']}
      expiration={{ type: 'preset', value: '90d' }}
      templateUrl="https://example.com/tokens/new?name=My+API+Token&scope=read%3Aall&scope=user%3Atoken&expiration=90d"
    />
  ),
};

export const WithManyScopes: Story = {
  render: () => (
    <InteractiveWrapper
      token="gt-abcdef1234567890abcdef1234567890"
      tokenName="Comprehensive Token"
      scopes={[
        'admin:token',
        'exec:admin',
        'exec:notebook',
        'exec:portal',
        'read:alertdb',
        'read:image',
        'read:tap',
        'user:token',
        'write:notebook',
      ]}
      expiration={{ type: 'preset', value: '30d' }}
      templateUrl="https://example.com/tokens/new?name=Comprehensive+Token&scope=admin%3Atoken&scope=exec%3Aadmin&scope=exec%3Anotebook&scope=exec%3Aportal&scope=read%3Aalertdb&scope=read%3Aimage&scope=read%3Atap&scope=user%3Atoken&scope=write%3Anotebook&expiration=30d"
    />
  ),
};

export const NeverExpires: Story = {
  render: () => (
    <InteractiveWrapper
      token="gt-never-expires-token-1234567890ab"
      tokenName="Permanent Token"
      scopes={['read:all']}
      expiration={{ type: 'never' }}
      templateUrl="https://example.com/tokens/new?name=Permanent+Token&scope=read%3Aall&expiration=never"
    />
  ),
};

export const ShortExpiration: Story = {
  render: () => (
    <InteractiveWrapper
      token="gt-short-lived-token-abcdef123456"
      tokenName="Temporary Testing Token"
      scopes={['exec:notebook', 'read:tap']}
      expiration={{ type: 'preset', value: '1d' }}
      templateUrl="https://example.com/tokens/new?name=Temporary+Testing+Token&scope=exec%3Anotebook&scope=read%3Atap&expiration=1d"
    />
  ),
};

export const SevenDayExpiration: Story = {
  render: () => (
    <InteractiveWrapper
      token="gt-seven-day-token-9876543210"
      tokenName="Seven Day Token"
      scopes={['user:token', 'read:image']}
      expiration={{ type: 'preset', value: '7d' }}
      templateUrl="https://example.com/tokens/new?name=Seven+Day+Token&scope=user%3Atoken&scope=read%3Aimage&expiration=7d"
    />
  ),
};

export const LongTokenName: Story = {
  render: () => (
    <InteractiveWrapper
      token="gt-long-name-token-abcdef123456"
      tokenName="This is a very long token name that might wrap to multiple lines in the display"
      scopes={['read:all', 'write:notebook', 'exec:portal']}
      expiration={{ type: 'preset', value: '7d' }}
      templateUrl="https://example.com/tokens/new?name=This+is+a+very+long+token+name+that+might+wrap+to+multiple+lines+in+the+display&scope=read%3Aall&scope=write%3Anotebook&scope=exec%3Aportal&expiration=7d"
    />
  ),
};

export const VeryLongToken: Story = {
  render: () => (
    <InteractiveWrapper
      token="gt-1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
      tokenName="Super Long Token"
      scopes={['read:all']}
      expiration={{ type: 'preset', value: '90d' }}
      templateUrl="https://example.com/tokens/new?name=Super+Long+Token&scope=read%3Aall&expiration=90d"
    />
  ),
};

export const MinimalConfiguration: Story = {
  render: () => (
    <InteractiveWrapper
      token="gt-minimal-config-123456"
      tokenName="Simple"
      scopes={['read:all']}
      expiration={{ type: 'preset', value: '90d' }}
      templateUrl="https://example.com/tokens/new?name=Simple&scope=read%3Aall&expiration=90d"
    />
  ),
};
