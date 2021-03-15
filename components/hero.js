import styled from 'styled-components';

import { StyledFullBleed } from './background';

const ContentContainer = styled.div`
  margin: 0 auto;
  max-width: 60rem;
`;

const ServiceCardContainer = styled.div`
  width: 100%;
  display: grid;
  row-gap: 1em;
  column-gap: 1em;
  grid-template-columns: repeat(auto-fit, minmax(min(18em, 100%), 1fr));
`;

const ServiceCard = styled.div`
  min-width: 5rem;
  border-radius: 0.5rem;
  background-color: #ffffff;
  color: #111111;
  padding: 1rem;

  /* Flexbox for the sticky footer */
  display: flex;
  flex-direction: column;

  .upper-container {
    flex: 1 0 auto;
  }
  .sticky-footer-container {
    flex-shink: 0;
    margin-top: 2rem;
  }
`;

const StyledAspectIllustration = styled.img`
  width: 100%;
  height: auto;
  padding: 2rem;
`;

/*
 * The hero element for displaying available services (Science Platform
 * aspects) that's featured on the homepage.
 */
export default function Hero() {
  return (
    <StyledFullBleed
      imagePath="/lsst-stills-0014.jpg"
      fallbackColor="#333333"
      textColor="#ffffff"
    >
      <ContentContainer>
        <h1>Rubin Science Platform</h1>
        <ServiceCardContainer>
          <ServiceCard>
            <div className="upper-container">
              <a href="/nb">
                <h2>Portal</h2>
                <p>Discover data in the browser</p>
                <StyledAspectIllustration src="/undraw_Location_search_re_ttoj.svg" />
              </a>
            </div>
            <div className="sticky-footer-container">
              <a href="/">Learn more about the portal.</a>
            </div>
          </ServiceCard>
          <ServiceCard>
            <div className="upper-container">
              <a href="/portal/app/">
                <h2>Notebooks</h2>
                <p>
                  Process and analyze LSST data with Jupyter notebooks in the
                  cloud
                </p>
                <StyledAspectIllustration src="/undraw_Data_re_80ws.svg" />
              </a>
            </div>
            <div className="sticky-footer-container">
              <a href="/">Learn more about notebooks.</a>
            </div>
          </ServiceCard>
          <ServiceCard>
            <a href="/">
              <h2>APIs</h2>
              <p>
                Learn how to programatically access data with Virtual
                Observatory interfaces
              </p>
              <StyledAspectIllustration src="/undraw_server_status_5pbv.svg" />
            </a>
          </ServiceCard>
        </ServiceCardContainer>
      </ContentContainer>
    </StyledFullBleed>
  );
}
