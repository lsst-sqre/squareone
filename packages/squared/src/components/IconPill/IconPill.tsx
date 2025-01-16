import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconPrefix, IconName } from '@fortawesome/fontawesome-svg-core';

export interface IconPillProps {
  text: string;
  url: string;
  icon: [IconPrefix, IconName];
  backgroundColor?: string;
  textColor?: string;
}

const PillContainer = styled.span<{
  backgroundColor: string;
  textColor: string;
}>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 0.5em;
  color: ${(props) => props.textColor};
  background-color: ${(props) => props.backgroundColor};
  font-size: 0.9rem;
  font-weight: 700;

  a {
    text-decoration: none;
    color: inherit;
  }

  &:hover {
    box-shadow: 0 10px 15px -10px rgba(22, 23, 24, 0.35);
  }
`;

const StyledFontAwesomeIcon = styled(FontAwesomeIcon)`
  display: inline-block;
  margin-right: 0.4em;
  font-size: 0.9em;
`;

export const IconPill: React.FC<IconPillProps> = ({
  icon,
  text,
  url,
  backgroundColor = '#e0e0e0',
  textColor = '#000000',
}) => {
  return (
    <PillContainer backgroundColor={backgroundColor} textColor={textColor}>
      <a href={url}>
        <StyledFontAwesomeIcon icon={icon} />
        {text}
      </a>
    </PillContainer>
  );
};

export default IconPill;
