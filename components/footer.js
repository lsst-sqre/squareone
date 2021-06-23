import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';

import { ContentMaxWidth } from '../styles/sizes';

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
          <Link href="/acceptable-use-policy">Acceptable use policy</Link>
        </FooterNav>
        <FundingNotice>
          <p>
            <a href="https://www.nsf.gov/">NSF</a> and{' '}
            <a href="https://www.energy.gov">DOE</a> provide financial support
            for Rubin Observatory in its operations phase to carry out the
            Legacy Survey of Space and Time including support for scientific
            research with the data. NSF funding is managed by the Association of
            Universities for Research in Astronomy (
            <a href="http://www.aura-astronomy.org/">AURA</a>) under a
            cooperative agreement with NSF, and DOE funding is managed by SLAC
            under contract by DOE. The operations phase of Rubin Observatory is
            operated jointly by NSF’s{' '}
            <a href="https://noirlab.edu/public/">NOIRLab</a> and SLAC National
            Accelerator Laboratory (
            <a href="https://www6.slac.stanford.edu/">SLAC</a>).
          </p>
          <p>
            The National Science Foundation (NSF) is an independent federal
            agency created by{' '}
            <a href="https://www.nsf.gov/od/ogc/leg.jsp">Congress</a> in 1950 to
            promote the progress of science. NSF supports basic research and
            people to create knowledge that transforms the future.
          </p>
        </FundingNotice>
        <PartnerLogoContainer>
          <Image
            className="u-invertable-image"
            src="/operations-lineup-black.png"
            width="800px"
            height="158px"
          />
        </PartnerLogoContainer>
      </div>
    </StyledFooter>
  );
}
