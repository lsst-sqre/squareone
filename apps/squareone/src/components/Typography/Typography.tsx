import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import styles from './Typography.module.css';

type LedeProps = {
  children: ReactNode;
} & ComponentPropsWithoutRef<'p'>;

export function Lede({ children, className, ...props }: LedeProps) {
  const combinedClassName = className
    ? `${styles.lede} ${className}`
    : styles.lede;

  return (
    <p className={combinedClassName} {...props}>
      {children}
    </p>
  );
}

type CtaLinkProps = {
  children: ReactNode;
  href: string;
} & ComponentPropsWithoutRef<'a'>;

export function CtaLink({ children, className, href, ...props }: CtaLinkProps) {
  const combinedClassName = className
    ? `${styles.ctaLink} ${className}`
    : styles.ctaLink;

  return (
    <a className={combinedClassName} href={href} {...props}>
      {children}
    </a>
  );
}
