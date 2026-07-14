/**
 * Tests for the generated design-token CSS output.
 *
 * The rubin-style-dictionary has no build step in the usual sense — it
 * compiles the YAML token sources into `dist/tokens.css` (light/default
 * theme) and `dist/tokens.dark.css` (dark theme) via `build.js`. These
 * tests run that build once and assert on the generated CSS custom
 * properties, so token contracts that downstream packages depend on
 * (e.g. `--rsd-color-primary-600` never changing) are guarded.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(dirname, '..');
const distDir = path.join(packageDir, 'dist');

let lightCss = '';
let darkCss = '';

/**
 * Extract the value of a CSS custom property from a `:root`-style block.
 *
 * Returns the trimmed value (without the trailing `;` or any comment) or
 * `undefined` if the variable is not declared.
 */
function cssVar(css, name) {
  const match = css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`, 'i'));
  return match ? match[1].trim() : undefined;
}

beforeAll(() => {
  execFileSync('node', ['build.js'], { cwd: packageDir, stdio: 'pipe' });
  lightCss = fs.readFileSync(path.join(distDir, 'tokens.css'), 'utf8');
  darkCss = fs.readFileSync(path.join(distDir, 'tokens.dark.css'), 'utf8');
});

describe('primary color ramp', () => {
  it('adds a primary-650 step at #046f70 (>=4.5:1 on white)', () => {
    expect(cssVar(lightCss, '--rsd-color-primary-650')).toBe('#046f70');
  });

  it('leaves primary-600 (official brand color) unchanged at #058b8c', () => {
    expect(cssVar(lightCss, '--rsd-color-primary-600')).toBe('#058b8c');
  });
});

describe('semantic interactive token', () => {
  it('exposes a component interactive color that resolves to primary-650', () => {
    expect(cssVar(lightCss, '--rsd-component-interactive-color')).toBe(
      '#046f70'
    );
  });
});

describe('headline token', () => {
  it('renders headlines in body black (#1f2121) in the light theme', () => {
    expect(cssVar(lightCss, '--rsd-component-text-headline-color')).toBe(
      '#1f2121'
    );
  });

  it('renders headlines in the dark-theme body text color, not teal', () => {
    const headline = cssVar(darkCss, '--rsd-component-text-headline-color');
    expect(headline).toBeDefined();
    // Dark-theme body text is gray-100; must not fall back to brand teal.
    expect(headline).not.toBe('#058b8c');
    expect(headline).toBe('#dce0e3');
  });
});
