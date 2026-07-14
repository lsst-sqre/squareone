import FullBleedBackgroundImageSection from './FullBleedBackgroundImageSection';

export default {
  title: 'Components/FullBleedBackgroundImageSection',
  component: FullBleedBackgroundImageSection,
  parameters: {
    layout: 'fullscreen',
  },
};

/*
 * Hero-style white text over the section, mirroring the homepage hero. The
 * scrim behind the content keeps the white heading readable (>=4.5:1) even
 * over the brightest regions of the background photo.
 */
function HeroContent() {
  return (
    <div
      style={{
        maxWidth: '60rem',
        margin: '0 auto',
        padding: '4rem 2rem',
        color: '#ffffff',
      }}
    >
      <h1
        style={{
          // The homepage <h1> forces white via `--c-component-text-reverse-
          // color`; mirror that here so the story reflects real hero styling
          // (the global headline color is otherwise body-black).
          color: '#ffffff',
          fontSize: '3rem',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Rubin Science Platform
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.125rem' }}>
        White hero text stays legible over the background image thanks to the
        scrim overlay.
      </p>
    </div>
  );
}

/*
 * The default background photo used across the app, exercising the scrim over
 * a real image with bright regions.
 */
export const Default = {
  render: () => (
    <FullBleedBackgroundImageSection
      imagePath="/Quint-DSC1187.jpg"
      fallbackColor="#333333"
      textColor="#ffffff"
    >
      <HeroContent />
    </FullBleedBackgroundImageSection>
  ),
};

/*
 * Desktop viewport: the scrim should keep the heading readable across the
 * full width of the image.
 */
export const Desktop = {
  ...Default,
  parameters: {
    ...Default.parameters,
    viewport: { defaultViewport: 'responsive' },
  },
};

/*
 * Mobile viewport: verify the treatment still reads well and does not cause
 * horizontal overflow at narrow widths.
 */
export const Mobile = {
  ...Default,
  parameters: {
    ...Default.parameters,
    viewport: { defaultViewport: 'mobile1' },
  },
};
