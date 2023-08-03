import Image from 'next/image';
import Link from 'next/link';

import LogoImage from '@lsst-sqre/rubin-style-dictionary/assets/rubin-imagotype/rubin-imagotype-color-on-black.svg';

/*
 * Logo (within the Header).
 */
export default function HeaderLogo() {
  const logoHeightPx = 150;
  const logoWidthPx = logoHeightPx * 1.4882;

  return (
    <Link passhref href="/">
      <a>
        <Image
          src={LogoImage}
          alt="Rubin Observatory Logo"
          height={logoHeightPx}
          width={logoWidthPx}
        />
      </a>
    </Link>
  );
}
