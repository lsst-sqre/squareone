import styled from 'styled-components';
import Image from 'next/image';

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
  margin: 2rem 0;
`;

const FundingNotice = styled.div`
  font-size: 0.8rem;
`;

/*
 * Footer component (contained within a Page component).
 */
export default function Footer() {
  return (
    <StyledFooter>
      <div className="content">
        <FundingNotice>
          <p>
            Financial support for Rubin Observatory comes from the National
            Science Foundation (<a href="https://www.nsf.gov/">NSF</a>) through
            Cooperative Agreement No. 1258333, the Department of Energy (
            <a href="https://www.energy.gov">DOE</a>) Office of Science under
            Contract No. DE-AC02-76SF00515, and private funding raised by the{' '}
            <a href="http://www.lsstcorporation.org/">LSST Corporation</a>. The
            NSF-funded Rubin Observatory Project Office for construction was
            established as an operating center under management of the
            Association of Universities for Research in Astronomy (
            <a href="http://www.aura-astronomy.org/">AURA</a>). The DOE-funded
            effort to build the Rubin Observatory LSST Camera (LSSTCam) is
            managed by the SLAC National Accelerator Laboratory (
            <a href="https://www6.slac.stanford.edu/">SLAC</a>).
          </p>
          <p>
            The National Science Foundation (NSF) is an independent federal
            agency created by{' '}
            <a href="https://www.nsf.gov/od/ogc/leg.jsp">Congress</a> in 1950 to
            promote the progress of science. NSF supports basic research and
            people to create knowledge that transforms the future. NSF and DOE
            will continue to support Rubin Observatory in its Operations phase.
            They will also provide support for scientific research with LSST
            data.
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
