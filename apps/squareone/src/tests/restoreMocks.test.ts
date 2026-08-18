import { expect, test, vi } from 'vitest';

/*
 * Test-infrastructure guard for the unit vitest project's `restoreMocks: true`
 * (see `vitest.config.ts`).
 *
 * Specs across this app install spies with `vi.spyOn(...)` — most often on
 * `globalThis.fetch` — and never restore them inline, because an inline
 * `mockRestore()` at the end of a test is skipped whenever an assertion above
 * it throws. Without `restoreMocks`, the first genuinely failing test would
 * leave its stub installed for every test that follows, turning one real
 * failure into a cascade of misleading ones. This file pins the setting by
 * observing the behavior it buys, rather than reading the config value back.
 *
 * ORDERING CONTRACT: the two tests below are a pair and only mean anything in
 * this order. The first models a test that fails partway through with a spy
 * still installed — `test.fails` inverts its verdict so the suite stays green —
 * and the second asserts that vitest tore that spy down before it ran. They
 * therefore live alone in this file: inserting a test between them, reordering
 * them, or enabling `sequence.shuffle` would let the second one pass without
 * ever observing a leak, so it would report green while guarding nothing.
 *
 * `modelledFailureRan` makes that contract enforce itself: if the second test
 * ever runs without the first, it fails loudly instead of passing vacuously.
 * That is also why running the second test alone (`-t`) fails by design.
 */

// Set by the first test before it throws; asserted by the second.
let modelledFailureRan = false;

test.fails('a failing test may leave its fetch stub un-restored', () => {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(null, { status: 200 })
  );
  modelledFailureRan = true;

  // Deliberately wrong: this is the modelled failure that skips any inline
  // teardown a real test might have written after it.
  expect(vi.isMockFunction(globalThis.fetch)).toBe(false);
});

test('a failed test does not leak its fetch stub into later tests', () => {
  expect(
    modelledFailureRan,
    'the modelled-failure test above must run immediately before this one — see the ordering contract at the top of this file'
  ).toBe(true);

  expect(vi.isMockFunction(globalThis.fetch)).toBe(false);
});
