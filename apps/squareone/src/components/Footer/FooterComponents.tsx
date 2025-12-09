import AgencyLogos from '@lsst-sqre/rubin-style-dictionary/assets/partner-logos/rubin-partners.png';
import Image from 'next/legacy/image';
import type { ReactNode } from 'react';

import styles from './FooterComponents.module.css';

type FooterNavProps = {
  children: ReactNode;
};

/**
 * Navigation section for footer links.
 *
 * Example usage in MDX:
 * ```mdx
 * <FooterNav>
 *   <Link href="/terms">Acceptable use policy</Link>
 *   <Link href="/privacy">Privacy policy</Link>
 * </FooterNav>
 * ```
 */
export function FooterNav({ children }: FooterNavProps) {
  return <nav className={styles.footerNav}>{children}</nav>;
}

type FundingNoticeProps = {
  children: ReactNode;
};

/**
 * Container for funding and legal notices.
 *
 * Example usage in MDX:
 * ```mdx
 * <FundingNotice>
 *   <p>Your funding notice text here...</p>
 * </FundingNotice>
 * ```
 */
export function FundingNotice({ children }: FundingNoticeProps) {
  return <div className={styles.fundingNotice}>{children}</div>;
}

/**
 * Partner logos component that can be used in MDX.
 *
 * By default, displays the Rubin Observatory partner logos, but can be
 * customized with a different image source for site-specific branding.
 *
 * Example usage in MDX:
 * ```mdx
 * <PartnerLogos />
 * ```
 *
 * Or with custom image from public directory:
 * ```mdx
 * <PartnerLogos
 *   src="/custom-logos/partners.png"
 *   alt="Custom partner logos"
 * />
 * ```
 */
export function PartnerLogos({
  src,
  alt = 'Logos of the Vera C. Rubin Observatory, NSF, US DOE, NOIRLab, AURA, and SLAC.',
}: {
  src?: string | typeof AgencyLogos;
  alt?: string;
}) {
  // Use default Rubin logos if no src provided
  const imageSrc = src || AgencyLogos;

  return (
    <div className={styles.partnerLogoContainer}>
      <Image className="u-invertable-image" src={imageSrc} alt={alt} />
    </div>
  );
}
