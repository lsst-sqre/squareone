/**
 * Common sets of React components to use with MDXRemote.
 */

import Link from 'next/link';
import { Lede, CtaLink } from '../../components/Typography';
import { ComponentType } from 'react';

export const commonMdxComponents: Record<string, ComponentType<any>> = {
  Link,
  Lede,
  CtaLink,
};
