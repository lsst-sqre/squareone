import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Static assertion over the StringInput CSS module source.
 *
 * The Times Square parameter text input styles its border with a raw
 * design-token custom property. On the dark page (gray-800 #1F2121) a
 * gray-500 (#6A6E6E) border is only 3.13:1 — a marginal pass of the 3:1
 * non-text bar and darker than the sibling squared form controls. Moving to
 * gray-400 (#82898B) lifts it to 4.55:1 on dark (and stays 3.56:1 on white),
 * matching TextInput/TextArea/Select and giving a robust >=3:1 in both
 * themes. JSDOM cannot resolve CSS-module custom-property values, so reading
 * the source and asserting the border token is the durable check.
 */
const source = readFileSync(
  path.join(__dirname, 'StringInput.module.css'),
  'utf8'
);

describe('StringInput CSS design tokens', () => {
  it('does not use gray-500 for the input border', () => {
    // gray-500 border is 3.13:1 on the dark page — a marginal 3:1 pass.
    expect(source).not.toContain('--rsd-color-gray-500');
  });

  it('uses gray-400 for the input border (>=3:1 in both themes)', () => {
    expect(source).toContain('border-color: var(--rsd-color-gray-400)');
  });
});
