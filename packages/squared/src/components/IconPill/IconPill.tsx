import type { IconName, IconPrefix } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type React from 'react';
import styles from './IconPill.module.css';

export type IconPillProps = {
  text: string;
  url: string;
  icon: [IconPrefix, IconName];
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  textColor?: string;
};

/**
 * A pill-shaped button component that combines an icon and text with a link.
 *
 * @component
 * @param {Object} props - The component props
 * @param {IconDefinition} props.icon - The FontAwesome icon to display
 * @param {string} props.text - The text to display next to the icon
 * @param {string} props.url - The URL that the pill links to
 * @param {string} [props.backgroundColor='var(--sqo-primary-button-background-color)'] - The background color of the pill
 * @param {string} [props.hoverBackgroundColor='var(--sqo-primary-button-background-color-hover)'] - The background color of the pill on hover
 * @param {string} [props.textColor='#ffffff'] - The color of the text and icon
 * @returns {JSX.Element} A pill-shaped button containing an icon and text that links to a URL
 */
export const IconPill = ({
  icon,
  text,
  url,
  backgroundColor = 'var(--sqo-primary-button-background-color)',
  hoverBackgroundColor = 'var(--sqo-primary-button-background-color-hover)',
  textColor = '#ffffff',
}: IconPillProps) => {
  const pillStyle = {
    '--icon-pill-text-color': textColor,
    '--icon-pill-bg-color': backgroundColor,
    '--icon-pill-hover-bg-color': hoverBackgroundColor,
  } as React.CSSProperties;

  return (
    <span className={styles.pill} style={pillStyle}>
      <a href={url} className={styles.link}>
        <FontAwesomeIcon icon={icon} className={styles.icon} />
        {text}
      </a>
    </span>
  );
};

export default IconPill;
