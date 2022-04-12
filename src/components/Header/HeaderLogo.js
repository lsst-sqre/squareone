import Image from 'next/image';
import Link from 'next/link';

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
          src="/rubin-imagotype-color-on-black.svg"
          alt="Rubin Observatory Logo"
          height={logoHeightPx}
          width={logoWidthPx}
        />
      </a>
    </Link>
  );
}
