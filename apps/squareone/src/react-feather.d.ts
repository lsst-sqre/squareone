declare module 'react-feather' {
  import { FC, SVGProps } from 'react';

  export interface IconProps extends SVGProps<SVGSVGElement> {
    color?: string;
    size?: string | number;
  }

  export const X: FC<IconProps>;
  export const Home: FC<IconProps>;
  export const User: FC<IconProps>;
  export const ArrowRight: FC<IconProps>;
  export const Download: FC<IconProps>;
  export const Copy: FC<IconProps>;
  export const Check: FC<IconProps>;
  export const Clipboard: FC<IconProps>;
  export const ChevronDown: FC<IconProps>;
  export const Mail: FC<IconProps>;
  export const Search: FC<IconProps>;
  export const Eye: FC<IconProps>;
  export const EyeOff: FC<IconProps>;
}
