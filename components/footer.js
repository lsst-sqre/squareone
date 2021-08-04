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
          <Link href="/terms">Acceptable use policy</Link>
        </FooterNav>
        <FundingNotice>
          <p>
            Rubin Observatory is a joint initiative of the National Science
            Foundation (NSF) and the Department of Energy (DOE). Its primary
            mission is to carry out the Legacy Survey of Space and Time,
            providing an unprecedented data set for scientific research
            supported by both agencies. Rubin is operated jointly by NSF’s{' '}
            <a href="https://noirlab.edu/public/">NOIRLab</a> and SLAC National
            Accelerator Laboratory (
            <a href="https://www6.slac.stanford.edu/">SLAC</a>). NOIRLab is
            managed for NSF by the Association of Universities for Research in
            Astronomy (AURA) and SLAC is operated for DOE by Stanford
            University.
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
