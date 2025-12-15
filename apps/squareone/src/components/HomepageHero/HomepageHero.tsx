'use client';

import Link from 'next/link';
import React from 'react';

import { useAppConfig } from '../../contexts/AppConfigContext';
import FullBleedBackgroundImageSection from '../FullBleedBackgroundImageSection';
import styles from './HomepageHero.module.css';

/*
 * The hero element for displaying available services (Science Platform
 * aspects) that's featured on the homepage.
 */
export default function HomepageHero() {
  const { showPreview, previewLink, docsBaseUrl, siteName } = useAppConfig();

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
          <div className={styles.serviceCard}>
            <div className={styles.serviceCardUpperContainer}>
              <a href="/portal/app/">
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
              <a href="/portal/app/onlinehelp/">Learn more about the portal.</a>
            </div>
          </div>
          <div className={styles.serviceCard}>
            <div className={styles.serviceCardUpperContainer}>
              <a href="/nb/hub">
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
