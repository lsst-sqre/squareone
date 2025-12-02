import LogoImage from '@lsst-sqre/rubin-style-dictionary/assets/triad-horizontal/triad-horizontal-color-dark.png';
import Image from 'next/legacy/image';
import Link from 'next/link';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useAppConfig } from '@/contexts/AppConfigContext';

const PreLogo = () => {
  const config = useAppConfig();
  const [imageError, setImageError] = useState(false);

  // Determine logo source based on configuration priority
  let logoSrc: string | typeof LogoImage = LogoImage;
  let isConfiguredLogo = false;

  // Priority 1: External URL (must be HTTPS)
  if (config.headerLogoUrl) {
    if (config.headerLogoUrl.startsWith('https://')) {
      logoSrc = config.headerLogoUrl;
      isConfiguredLogo = true;
    } else {
      console.warn(
        'headerLogoUrl must use HTTPS protocol. Falling back to default logo.'
      );
    }
  }
  // Priority 2: Base64-encoded data URL
  else if (config.headerLogoData && config.headerLogoMimeType) {
    logoSrc = `data:${config.headerLogoMimeType};base64,${config.headerLogoData}`;
    isConfiguredLogo = true;
  }

  // Warn if configured logo is used without explicit width
  if (isConfiguredLogo && !config.headerLogoWidth) {
    console.warn(
      'headerLogoWidth should be provided when using headerLogoUrl or headerLogoData. ' +
        'Without explicit width, the image aspect ratio may be incorrect.'
    );
  }

  // Get dimensions - use configured values or calculate from default logo
  const logoHeight = config.headerLogoHeight ?? 50;
  let logoWidth: number | undefined;

  if (config.headerLogoWidth) {
    // Use explicitly configured width
    logoWidth = config.headerLogoWidth;
  } else if (!isConfiguredLogo) {
    // Calculate width from default logo's aspect ratio
    const { width, height } = LogoImage;
    logoWidth = (logoHeight * width) / height;
  }
  // For configured logos without explicit width, leave undefined to maintain aspect ratio

  // Get alt text - use configured value or default
  const logoAlt = config.headerLogoAlt ?? 'Logo';

  // Handle image load error - hide image per requirements
  const handleImageError = () => {
    console.error('Failed to load header logo image');
    setImageError(true);
  };

  // Don't render anything if image failed to load
  if (imageError) {
    return <PreLogoContainer />;
  }

  return (
    <PreLogoContainer>
      <Link href="/" aria-label={`Homepage of ${config.siteName}`}>
        <Image
          src={logoSrc}
          height={logoHeight}
          width={logoWidth}
          alt={logoAlt}
          onError={handleImageError}
        />
      </Link>
    </PreLogoContainer>
  );
};

const PreLogoContainer = styled.div`
  width: 100%;
  margin-bottom: 0.5rem;
`;

export default PreLogo;
