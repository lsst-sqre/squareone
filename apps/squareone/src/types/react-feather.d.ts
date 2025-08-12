// TypeScript declarations for react-feather
declare module 'react-feather' {
  import { FC } from 'react';

  type FeatherIconProps = {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
    className?: string;
    style?: React.CSSProperties;
  };

  export const ChevronDown: FC<FeatherIconProps>;

  // Add other icons as needed
  export const ChevronUp: FC<FeatherIconProps>;
  export const Menu: FC<FeatherIconProps>;
  export const X: FC<FeatherIconProps>;
}
