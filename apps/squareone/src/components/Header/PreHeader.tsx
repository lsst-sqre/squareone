import React from 'react';
import LogoImage from '@lsst-sqre/rubin-style-dictionary/assets/triad-horizontal/triad-horizontal-color-dark.png';
import Image from 'next/legacy/image';
import Link from 'next/link';
import styled from 'styled-components';

const PreLogo = () => {
  /*
   * We're using the "intrinsic" layout behaviour for the legacy Next.js Image
   * component. This means that the image will be the set size up to the set
   * width of its container.
   */
  const { width, height } = LogoImage;
  const logoHeight = 50;
  const logoWidth = (logoHeight * width) / height;

  return (
    <PreLogoContainer>
      <Link href="/" aria-label="Homepage of Rubin Science Platform">
        <Image
          src={LogoImage}
          height={logoHeight}
          width={logoWidth}
          alt="Rubin Observatory Logo"
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
