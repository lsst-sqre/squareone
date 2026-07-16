import { describe, expect, test } from 'vitest';
import { broadcastAccessibleName } from './broadcastLabel';

// broadcastAccessibleName delegates Markdown-to-plain-text extraction to the
// AST-based markdownToPlainText utility (covered by its own tests) and owns only
// the truncation/fallback logic. These tests confirm the delegation reaches the
// aria-label (no literal Markdown syntax survives) plus the truncation behavior.

describe('broadcastAccessibleName', () => {
  test('strips bold emphasis markers via the plain-text extractor', () => {
    expect(
      broadcastAccessibleName(
        'Scheduled maintenance on **February 1, 2025** from 06:00–10:00 UTC.'
      )
    ).toBe('Scheduled maintenance on February 1, 2025 from 06:00–10:00 UTC.');
  });

  test('reduces links to their visible text, dropping the URL', () => {
    expect(
      broadcastAccessibleName(
        'Please review the updated [data rights policy](https://example.com/policy).'
      )
    ).toBe('Please review the updated data rights policy.');
  });

  test('preserves snake_case identifiers inside words', () => {
    // The AST extractor must not treat intra-word underscores as emphasis, or it
    // would corrupt dataset/table identifiers common in Rubin broadcasts.
    expect(broadcastAccessibleName('The dp0_2 and dp0_3 datasets')).toBe(
      'The dp0_2 and dp0_3 datasets'
    );
  });

  test('preserves bare asterisks that are not emphasis', () => {
    expect(broadcastAccessibleName('5 * 3 * 2 nodes')).toBe('5 * 3 * 2 nodes');
  });

  test('returns an empty string when nothing readable remains', () => {
    expect(broadcastAccessibleName('   ')).toBe('');
    expect(broadcastAccessibleName('**  **')).toBe('');
  });

  test('truncates long summaries on a word boundary with an ellipsis', () => {
    const long =
      'This is a very long broadcast summary that greatly exceeds the maximum length allowed for a landmark accessible name and should be truncated.';
    const result = broadcastAccessibleName(long);

    expect(result.endsWith('…')).toBe(true);
    // The visible text (excluding the ellipsis) stays within the cap.
    expect(result.length - 1).toBeLessThanOrEqual(80);

    // The kept text is a whole-word prefix of the original: the original must
    // continue with a space (or end) right after it, so no word was split.
    const kept = result.slice(0, -1);
    expect(long.startsWith(kept)).toBe(true);
    const nextChar = long.charAt(kept.length);
    expect(nextChar === '' || nextChar === ' ').toBe(true);
  });

  test('does not truncate summaries at or below the length cap', () => {
    const short = 'Short and sweet.';
    expect(broadcastAccessibleName(short)).toBe(short);
  });
});
