import styled from 'styled-components';
import Link from 'next/link';

import FullBleedBackgroundImageSection from '../FullBleedBackgroundImageSection';
import { ContentMaxWidth } from '../../styles/sizes';
import { useAppConfig } from '../../contexts/AppConfigContext';

const ContentContainer = styled.div`
  margin: 0 auto;
  max-width: ${ContentMaxWidth};
  padding: 2rem var(--size-screen-padding-min);

  @media (min-width: ${ContentMaxWidth}) {
    padding: 2rem 0;
  }

  color: var(--c-component-text-reverse-color);

  .hero-title {
    color: var(--c-component-text-reverse-color);
    text-align: center;
    font-size: 3rem;
    margin: 0;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
`;

const PreviewBadge = styled.a`
  display: inline-block;
  padding: 0.5rem 1rem;
  border: 2px solid var(--rsd-color-primary-600);
  border-radius: 0.5rem;
  color: var(--c-component-text-reverse-color);
  background-color: color-mix(
    in srgb,
    var(--rsd-color-primary-600) 20%,
    transparent
  );
  backdrop-filter: blur(1px);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  transition: background-color 0.2s ease, backdrop-filter 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);

  &:hover {
    background-color: var(--rsd-color-primary-600);
    color: var(--rsd-component-text-color);
  }
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
  background-color: var(--rsd-component-service-card-background-color);
  color: var(--rsd-component-service-card-text-color);
  padding: 1rem;

  .title {
    margin-top: 0.5rem;
  }

  .subtitle {
    color: var(--rsd-component-text-color);
  }

  /* Flexbox for the sticky footer */
  display: flex;
  flex-direction: column;

  .upper-container {
    flex: 1 0 auto;
  }
  .sticky-footer-container {
    flex-shrink: 0;
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
export default function HomepageHero() {
  const { showPreview, previewLink, docsBaseUrl, siteName } = useAppConfig();

  return (
    <FullBleedBackgroundImageSection
      $imagePath="/Quint-DSC1187.jpg"
      $fallbackcolor="#333333"
      $textColor="#ffffff"
    >
      <ContentContainer>
        <TitleContainer>
          <h1 className="hero-title">{siteName}</h1>
          {showPreview && (
            <PreviewBadge
              href={previewLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Learn about our development roadmap."
            >
              Preview
            </PreviewBadge>
          )}
        </TitleContainer>
        <ServiceCardContainer>
          <ServiceCard>
            <div className="upper-container">
              <a href="/portal/app/">
                <h2 className="title">Portal</h2>
                <p className="subtitle">Discover data in the browser</p>
                <StyledAspectIllustration src="/undraw_Location_search_re_ttoj.svg" />
              </a>
            </div>
            <div className="sticky-footer-container">
              <a href="/portal/app/onlinehelp/">Learn more about the portal.</a>
            </div>
          </ServiceCard>
          <ServiceCard>
            <div className="upper-container">
              <a href="/nb/hub">
                <h2 className="title">Notebooks</h2>
                <p className="subtitle">
                  Process and analyze LSST data with Jupyter notebooks in the
                  cloud
                </p>
                <StyledAspectIllustration src="/undraw_Data_re_80ws.svg" />
              </a>
            </div>
            <div className="sticky-footer-container">
              <a href={`${docsBaseUrl}/guides/notebooks/index.html`}>
                Learn more about notebooks.
              </a>
            </div>
          </ServiceCard>
          <ServiceCard>
            <div className="upper-container">
              <Link href="/api-aspect">
                <h2 className="title">APIs</h2>
                <p className="subtitle">
                  Learn how to programatically access data with Virtual
                  Observatory interfaces
                </p>
                <StyledAspectIllustration src="/undraw_server_status_5pbv.svg" />
              </Link>
            </div>
          </ServiceCard>
        </ServiceCardContainer>
      </ContentContainer>
    </FullBleedBackgroundImageSection>
  );
}
