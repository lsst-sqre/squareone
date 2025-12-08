import type React from 'react';

import styles from './FullBleedBackgroundImageSection.module.css';

export type FullBleedBackgroundImageSectionProps = {
  textColor?: string;
  fallbackColor?: string;
  imagePath?: string;
  children?: React.ReactNode;
};

/*
 * Section with a full-bleed background image for content areas.
 */
export default function FullBleedBackgroundImageSection({
  textColor,
  fallbackColor,
  imagePath,
  children,
}: FullBleedBackgroundImageSectionProps) {
  return (
    <section
      className={styles.section}
      style={
        {
          '--text-color': textColor,
          '--fallback-color': fallbackColor,
          '--image-path': imagePath ? `url(${imagePath})` : undefined,
        } as React.CSSProperties
      }
    >
      {children}
    </section>
  );
}
