import styled from 'styled-components';

/*
 * Section with a full-bleed background image for content areas.
 */
const FullBleedBackgroundImageSection = styled.section`
  color: ${(props) => props.textColor || '#ffffff'};
  background-color: ${(props) => props.fallbackColor || '#333333'};
  background-image: url(${(props) =>
    props.imagePath || '/lsst-stills-0014.jpg'});
  background-size: cover;

  // Full-width in a constrained parent
  // https://css-tricks.com/full-width-containers-limited-width-parents/
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-top: 0;
`;

export default FullBleedBackgroundImageSection;
