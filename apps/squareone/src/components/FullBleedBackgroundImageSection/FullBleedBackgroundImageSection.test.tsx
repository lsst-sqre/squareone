import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import FullBleedBackgroundImageSection from './FullBleedBackgroundImageSection';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Static assertion over the FullBleedBackgroundImageSection CSS module source.
 *
 * White hero text (the homepage <h1> site name) sits directly over the
 * background photo. The brightest region of `Quint-DSC1187.jpg` is roughly
 * rgb(207, 206, 214), against which white text measures only ~1.6:1 — far
 * below the WCAG 1.4.3 4.5:1 bar. A 50% black scrim composites that worst-case
 * region to ~rgb(104, 103, 107), lifting white text to ~5.6:1 (>=4.5:1). The
 * scrim opacity is exposed as `--scrim-opacity` (default 0.5) so hosts can
 * tune it, but the default must satisfy the contrast bar. JSDOM cannot
 * resolve composited pixels or CSS custom-property defaults, so reading the
 * module source and asserting the scrim contract is the durable check.
 */
const source = readFileSync(
  path.join(__dirname, 'FullBleedBackgroundImageSection.module.css'),
  'utf8'
);

describe('FullBleedBackgroundImageSection', () => {
  it('renders children above the scrim in a content layer', () => {
    const { getByTestId } = render(
      <FullBleedBackgroundImageSection>
        <p data-testid="hero-child">Rubin Science Platform</p>
      </FullBleedBackgroundImageSection>
    );
    const child = getByTestId('hero-child');
    // Children must be wrapped in a content layer (not direct children of the
    // <section>) so they stack above the absolutely-positioned scrim.
    const contentLayer = child.parentElement;
    expect(contentLayer).not.toBeNull();
    expect(contentLayer?.className).toMatch(/content/i);
  });
});

describe('FullBleedBackgroundImageSection scrim CSS', () => {
  it('defines a scrim overlay with a black base color', () => {
    // The scrim darkens bright image regions so white text clears 4.5:1.
    expect(source).toMatch(/--scrim-color/);
    expect(source).toMatch(/--scrim-color[^;]*#000000/);
  });

  it('defaults the scrim opacity to 0.5 (>=4.5:1 over the brightest region)', () => {
    // 0.5 composites the brightest pixel (~rgb(207,206,214)) to ~rgb(104,
    // 103,107), giving white text ~5.6:1. A lighter scrim (e.g. 0.4 -> 4.17:1)
    // would drop below the bar, so lock the accessible default.
    expect(source).toMatch(/--scrim-opacity[^;]*0\.5/);
  });

  it('layers content above the scrim', () => {
    // The content layer needs a stacking context above the scrim pseudo-
    // element so the darkening never falls on top of the hero text.
    expect(source).toMatch(/\.content/);
    expect(source).toMatch(/z-index/);
  });
});
