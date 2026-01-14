import AgencyLogos from '@lsst-sqre/rubin-style-dictionary/assets/partner-logos/rubin-partners.png';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactElement } from 'react';

import styles from '../components/Footer/Footer.module.css';

type FooterRscProps = {
  /** Pre-compiled MDX content as a React element */
  mdxContent?: ReactElement | null;
};

/**
 * Footer component for App Router.
 *
 * Unlike the Pages Router Footer which uses MDXRemote with serialized MDX,
 * this component accepts pre-compiled MDX content as a React element
 * (from compileMdxForRsc).
 *
 * If no custom MDX content is available, displays the default Rubin
 * Observatory footer with funding notices and partner logos.
 */
export default function FooterRsc({ mdxContent }: FooterRscProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        {mdxContent ? (
          mdxContent
        ) : (
          <>
            <nav className={styles.footerNav}>
              <Link href="/terms">Acceptable use policy</Link>
            </nav>
            <div className={styles.fundingNotice}>
              <p>
                The U.S. National Science Foundation (
                <a href="https://www.nsf.gov/">NSF</a>) and the U.S. Department
                of Energy (<a href="https://www.energy.gov/">DOE</a>) Office of
                Science will support Rubin Observatory in its operations phase
                to carry out the Legacy Survey of Space and Time. They will also
                provide support for scientific research with the data. During
                operations, NSF funding is managed by the Association of
                Universities for Research in Astronomy (
                <a href="https://www.aura-astronomy.org/">AURA</a>) under a
                cooperative agreement with NSF, and DOE funding is managed by
                SLAC National Accelerator Laboratory (
                <a href="https://www6.slac.stanford.edu/">SLAC</a>), under
                contract by DOE. Rubin Observatory is operated by{' '}
                <a href="https://noirlab.edu/public/">NSF NOIRLab</a> and SLAC.
              </p>
              <p>
                NSF is an independent federal agency created by Congress in 1950
                to promote the progress of science. NSF supports basic research
                and people to create knowledge that transforms the future.
              </p>
              <p>
                The DOE Office of Science is the single largest supporter of
                basic research in the physical sciences in the United States and
                is working to address some of the most pressing challenges of
                our time.
              </p>
            </div>
            <div className={styles.partnerLogoContainer}>
              <Image
                className="u-invertable-image"
                src={AgencyLogos}
                alt="Logos of the Vera C. Rubin Observatory, NSF, US DOE, NOIRLab, AURA, and SLAC."
                style={{
                  maxWidth: '100%',
                  width: 'auto',
                  height: 'auto',
                }}
              />
            </div>
          </>
        )}
      </div>
    </footer>
  );
}
