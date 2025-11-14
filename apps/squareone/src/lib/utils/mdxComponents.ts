/**
 * Common sets of React components to use with MDXRemote.
 */

import Link from 'next/link';
import type { ComponentType } from 'react';
import { CtaLink, Lede } from '../../components/Typography';

export const commonMdxComponents: Record<string, ComponentType<any>> = {
  Link,
  Lede,
  CtaLink,
};
