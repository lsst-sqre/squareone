import { describe, expect, it } from 'vitest';
import { validateBotUsername } from './botUsername';

describe('validateBotUsername', () => {
  it('accepts a valid bot- username that matches the Gafaelfawr regex', () => {
    expect(validateBotUsername('bot-example')).toBeNull();
  });

  it('rejects a username without the bot- prefix with a clear message', () => {
    const error = validateBotUsername('example');
    expect(error).not.toBeNull();
    expect(error).toContain('bot-');
  });

  it('rejects a username with uppercase characters', () => {
    const error = validateBotUsername('bot-Example');
    expect(error).not.toBeNull();
    expect(error).toContain('lowercase');
  });

  it('rejects a username with illegal characters', () => {
    const error = validateBotUsername('bot-foo_bar');
    expect(error).not.toBeNull();
    expect(error).toContain('lowercase');
  });

  it('rejects a username ending with a hyphen (bad terminal character)', () => {
    const error = validateBotUsername('bot-foo-');
    expect(error).not.toBeNull();
    expect(error).toContain('lowercase');
  });

  it('rejects an empty username with a required message', () => {
    const error = validateBotUsername('');
    expect(error).not.toBeNull();
    expect(error).toMatch(/required/i);
  });

  it('accepts a valid bot- username containing digits and hyphens', () => {
    expect(validateBotUsername('bot-test-42')).toBeNull();
  });
});
