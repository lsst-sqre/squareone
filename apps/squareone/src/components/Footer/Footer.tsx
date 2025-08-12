import styled from 'styled-components';
import Image from 'next/legacy/image';
import Link from 'next/link';

import AgencyLogos from '@lsst-sqre/rubin-style-dictionary/assets/partner-logos/rubin-partners.png';

import { ContentMaxWidth } from '../../styles/sizes';

const StyledFooter = styled.footer`
  // Full-with in a constrained parent
  // https://css-tricks.com/full-width-containers-limited-width-parents/
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-top: 0;

  background-color: var(--rsd-component-footer-background-color);

  .content {
    margin: 0 auto;
    max-width: ${ContentMaxWidth};
    padding: 2rem var(--size-screen-padding-min);
  }

  @media (min-width: ${ContentMaxWidth}) {
    .content {
      padding: 2rem 0;
    }
  }
`;

const PartnerLogoContainer = styled.div`
  margin: 1rem 0;
`;

const FundingNotice = styled.div`
  font-size: 0.8rem;
`;

const FooterNav = styled.nav`
  margin-bottom: 2rem;
`;

/*
 * Footer component (contained within a Page component).
 */
export default function Footer() {
  return (
    <StyledFooter>
      <div className="content">
        <FooterNav>
          <Link href="/terms">Acceptable use policy</Link>
        </FooterNav>
        <FundingNotice>
          <p>
            The U.S. National Science Foundation (
            <a href="https://www.nsf.gov/">NSF</a>) and the U.S. Department of
            Energy (<a href="https://www.energy.gov/">DOE</a>) Office of Science
            will support Rubin Observatory in its operations phase to carry out
            the Legacy Survey of Space and Time. They will also provide support
            for scientific research with the data. During operations, NSF
            funding is managed by the Association of Universities for Research
            in Astronomy (<a href="https://www.aura-astronomy.org/">AURA</a>)
            under a cooperative agreement with NSF, and DOE funding is managed
            by SLAC National Accelerator Laboratory (
            <a href="https://www6.slac.stanford.edu/">SLAC</a>), under contract
            by DOE. Rubin Observatory is operated by{' '}
            <a href="https://noirlab.edu/public/">NSF NOIRLab</a> and SLAC.
          </p>
          <p>
            NSF is an independent federal agency created by Congress in 1950 to
            promote the progress of science. NSF supports basic research and
            people to create knowledge that transforms the future.
          </p>
          <p>
            The DOE Office of Science is the single largest supporter of basic
            research in the physical sciences in the United States and is
            working to address some of the most pressing challenges of our time.
          </p>
        </FundingNotice>
        <PartnerLogoContainer>
          <Image
            className="u-invertable-image"
            src={AgencyLogos}
            alt="Logos of the Vera C. Rubin Observatory, NSF, US DOE, NOIRLab, AURA, and SLAC."
          />
        </PartnerLogoContainer>
      </div>
    </StyledFooter>
  );
}
