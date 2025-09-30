import ExpirationSelector from './ExpirationSelector';

export default {
  title: 'TokenForm/ExpirationSelector',
  component: ExpirationSelector,
};

export const Default = () => (
  <ExpirationSelector onChange={() => {}} name="expiration" disabled={false} />
);

export const OneDay = () => (
  <ExpirationSelector
    value={{ type: 'preset', value: '1d' }}
    onChange={() => {}}
    name="expiration"
    disabled={false}
  />
);

export const SevenDays = () => (
  <ExpirationSelector
    value={{ type: 'preset', value: '7d' }}
    onChange={() => {}}
    name="expiration"
    disabled={false}
  />
);

export const ThirtyDays = () => (
  <ExpirationSelector
    value={{ type: 'preset', value: '30d' }}
    onChange={() => {}}
    name="expiration"
    disabled={false}
  />
);

export const NinetyDays = () => (
  <ExpirationSelector
    value={{ type: 'preset', value: '90d' }}
    onChange={() => {}}
    name="expiration"
    disabled={false}
  />
);

export const Never = () => (
  <ExpirationSelector
    value={{ type: 'never' }}
    onChange={() => {}}
    name="expiration"
    disabled={false}
  />
);

export const Disabled = () => (
  <ExpirationSelector
    value={{ type: 'preset', value: '90d' }}
    onChange={() => {}}
    name="expiration"
    disabled={true}
  />
);

export const WithTimezone = () => (
  <ExpirationSelector
    value={{ type: 'preset', value: '7d' }}
    onChange={() => {}}
    name="expiration"
    timezone="America/New_York"
    disabled={false}
  />
);
