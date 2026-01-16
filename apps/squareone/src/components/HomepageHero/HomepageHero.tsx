'use client';

import { useServiceDiscovery } from '@lsst-sqre/repertoire-client';
import Link from 'next/link';

import { useRepertoireUrl } from '../../hooks/useRepertoireUrl';
import { useStaticConfig } from '../../hooks/useStaticConfig';
import FullBleedBackgroundImageSection from '../FullBleedBackgroundImageSection';
import styles from './HomepageHero.module.css';

/*
 * The hero element for displaying available services (Science Platform
 * aspects) that's featured on the homepage.
 *
 * Service availability is determined by the Repertoire service discovery API.
 * When repertoireUrl is not configured, all services are shown with fallback URLs.
 * When configured, only available services are displayed.
 */
export default function HomepageHero() {
  const { showPreview, previewLink, docsBaseUrl, siteName } = useStaticConfig();
  const repertoireUrl = useRepertoireUrl();

  // Service discovery - query is null when URL is empty (disabled)
  const { query, isPending } = useServiceDiscovery(repertoireUrl ?? '');

  // Determine service availability
  // When not configured, show all services (backward compatibility)
  // When configured but loading, hide services until loaded
  // When configured and loaded, show only available services
  const isConfigured = !!repertoireUrl;
  const showPortal =
    !isConfigured || (!isPending && query?.hasPortal({ hasUi: true }));
  const showNublado =
    !isConfigured || (!isPending && query?.hasNublado({ hasUi: true }));

  // Get URLs from discovery or use fallbacks
  const portalUrl = query?.getPortalUrl() ?? '/portal/app/';
  const nubladoUrl = query?.getNubladoUrl() ?? '/nb/hub';

  // Derive portal help URL from portal URL
  const portalHelpUrl = portalUrl
    ? `${portalUrl.replace(/\/$/, '')}/onlinehelp/`
    : '/portal/app/onlinehelp/';

  return (
    <FullBleedBackgroundImageSection
      imagePath="/Quint-DSC1187.jpg"
      fallbackColor="#333333"
      textColor="#ffffff"
    >
      <div className={styles.contentContainer}>
        <div className={styles.titleContainer}>
          <h1 className={styles.heroTitle}>{siteName}</h1>
          {showPreview && (
            <a
              className={styles.previewBadge}
              href={previewLink}
              target="_blank"
              rel="noopener noreferrer"
              title="Learn about our development roadmap."
            >
              Preview
            </a>
          )}
        </div>
        <div className={styles.serviceCardContainer}>
          {showPortal && (
            <div className={styles.serviceCard}>
              <div className={styles.serviceCardUpperContainer}>
                <a href={portalUrl}>
                  <h2 className={styles.serviceCardTitle}>Portal</h2>
                  <p className={styles.serviceCardSubtitle}>
                    Discover data in the browser
                  </p>
                  <img
                    className={styles.aspectIllustration}
                    src="/undraw_Location_search_re_ttoj.svg"
                    alt=""
                  />
                </a>
              </div>
              <div className={styles.serviceCardStickyFooterContainer}>
                <a href={portalHelpUrl}>Learn more about the portal.</a>
              </div>
            </div>
          )}
          {showNublado && (
            <div className={styles.serviceCard}>
              <div className={styles.serviceCardUpperContainer}>
                <a href={nubladoUrl}>
                  <h2 className={styles.serviceCardTitle}>Notebooks</h2>
                  <p className={styles.serviceCardSubtitle}>
                    Process and analyze LSST data with Jupyter notebooks in the
                    cloud
                  </p>
                  <img
                    className={styles.aspectIllustration}
                    src="/undraw_Data_re_80ws.svg"
                    alt=""
                  />
                </a>
              </div>
              <div className={styles.serviceCardStickyFooterContainer}>
                <a href={`${docsBaseUrl}/guides/notebooks/index.html`}>
                  Learn more about notebooks.
                </a>
              </div>
            </div>
          )}
          <div className={styles.serviceCard}>
            <div className={styles.serviceCardUpperContainer}>
              <Link href="/api-aspect">
                <h2 className={styles.serviceCardTitle}>APIs</h2>
                <p className={styles.serviceCardSubtitle}>
                  Learn how to programatically access data with Virtual
                  Observatory interfaces
                </p>
                <img
                  className={styles.aspectIllustration}
                  src="/undraw_server_status_5pbv.svg"
                  alt=""
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </FullBleedBackgroundImageSection>
  );
}
