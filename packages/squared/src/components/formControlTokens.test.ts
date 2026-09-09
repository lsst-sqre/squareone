import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Static assertions over the form-control CSS module sources.
 *
 * These components (TextInput, TextArea, Select) style themselves with raw
 * design-token custom properties. Two classes of defect are invisible to
 * JSDOM-rendered tests but caught here by reading the CSS source directly:
 *
 * 1. References to tokens that do not exist in rubin-style-dictionary
 *    (`--rsd-color-red-900`, `--rsd-color-green-900`) silently resolve to
 *    nothing, so error/success text never gets its intended color.
 * 2. Borders keyed to `--rsd-color-gray-100` (#DCE0E3) measure only 1.33:1
 *    against a white page — a WCAG 1.4.11 non-text contrast failure. The
 *    accessible replacement is `--rsd-color-gray-400` (#82898B, 3.56:1).
 */

const formControlCss = [
  'TextInput/TextInput.module.css',
  'TextArea/TextArea.module.css',
  'Select/Select.module.css',
].map((relative) => ({
  relative,
  source: readFileSync(path.join(__dirname, relative), 'utf8'),
}));

describe('form-control CSS design tokens', () => {
  describe('no references to non-existent color-ramp steps', () => {
    // The red and green ramps stop at step 800; there is no 900 step.
    for (const brokenToken of [
      '--rsd-color-red-900',
      '--rsd-color-green-900',
    ]) {
      for (const { relative, source } of formControlCss) {
        it(`${relative} does not reference ${brokenToken}`, () => {
          expect(source).not.toContain(brokenToken);
        });
      }
    }
  });

  describe('borders meet the 3:1 non-text contrast bar', () => {
    // gray-100 (#DCE0E3) is only 1.33:1 on white; gray-400 (#82898B) is 3.56:1.
    for (const { relative, source } of formControlCss) {
      it(`${relative} does not use gray-100 for control borders`, () => {
        // gray-100 is legitimate elsewhere (e.g. surfaces), but these files
        // only use it for the control border/appearance, so it should be gone.
        expect(source).not.toContain('--rsd-color-gray-100');
      });
    }
  });
});
