import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core';

export interface IconPillProps {
  text: string;
  url: string;
  icon: [IconPrefix, IconName];
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  textColor?: string;
}

const PillContainer = styled.span<{
  $backgroundColor: string;
  $hoverBackgroundColor: string;
  $textColor: string;
}>`
  display: inline-block;
  padding: var(--sqo-space-xxxs) var(--sqo-space-unit);
  border: 1px solid transparent;
  border-radius: var(--sqo-border-radius-2);
  color: ${(props) => props.$textColor};
  background-color: ${(props) => props.$backgroundColor};
  font-size: 0.9rem;
  font-weight: 700;
  transition: var(--sqo-transition-basic);
  box-shadow: var(--sqo-elevation-sm);

  a {
    text-decoration: none;
    color: inherit;
  }

  &:hover {
    background-color: ${(props) => props.$hoverBackgroundColor};
    box-shadow: var(--sqo-elevation-lg);
  }
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  display: inline-block;
  margin-right: 0.4em;
  font-size: 0.9em;
`;

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
export const IconPill: React.FC<IconPillProps> = ({
  icon,
  text,
  url,
  backgroundColor = 'var(--sqo-primary-button-background-color)',
  hoverBackgroundColor = 'var(--sqo-primary-button-background-color-hover)',
  textColor = '#ffffff',
}) => {
  return (
    <PillContainer
      $textColor={textColor}
      $backgroundColor={backgroundColor}
      $hoverBackgroundColor={hoverBackgroundColor}
    >
      <a href={url}>
        <StyledFontAwesomeIcon icon={icon} />
        {text}
      </a>
    </PillContainer>
  );
};

export default IconPill;
