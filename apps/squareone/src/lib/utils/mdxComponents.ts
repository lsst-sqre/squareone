/**
 * Common sets of React components to use with MDXRemote.
 */

import Link from 'next/link';
import type { ComponentType } from 'react';
import {
  FooterNav,
  FundingNotice,
  PartnerLogos,
} from '../../components/Footer/FooterComponents';
import { CtaLink, Lede } from '../../components/Typography';

// biome-ignore lint/suspicious/noExplicitAny: MDX components accept any props
export const commonMdxComponents: Record<string, ComponentType<any>> = {
  Link,
  Lede,
  CtaLink,
};

/**
 * MDX components specifically for footer content.
 * Extends commonMdxComponents with footer-specific styled components.
 */
// biome-ignore lint/suspicious/noExplicitAny: MDX components accept any props
export const footerMdxComponents: Record<string, ComponentType<any>> = {
  ...commonMdxComponents,
  FooterNav,
  FundingNotice,
  PartnerLogos,
};
