/*
 * Full-bleed background images for content areas.
 */

import styled from 'styled-components';

const StyledFullBleed = styled.section`
  color: ${(props) => props.textColor || '#ffffff'};
  background-color: ${(props) => props.fallbackColor || '#333333'};
  background-image: url(${(props) =>
    props.imagePath || '/lsst-stills-0014.jpg'});
  background-size: cover;

  // Full-with in a constrained parent
  // https://css-tricks.com/full-width-containers-limited-width-parents/
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-top: 0;
`;

export { StyledFullBleed };
