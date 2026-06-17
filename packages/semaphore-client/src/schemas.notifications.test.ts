import { describe, expect, it } from 'vitest';
import {
  CreateUserNotificationSchema,
  UserNotificationSchema,
  UserNotificationWithUrlSchema,
} from './schemas';

describe('UserNotificationWithUrlSchema', () => {
  it('parses a representative admin list payload with raw-Markdown text', () => {
    const payload = {
      id: '4561-a7513',
      created: '2026-06-12T17:10:32+00:00',
      read: '2026-06-13T14:45:12+00:00',
      sender: 'bot-quota-notifier',
      recipient: 'some-user',
      summary: 'You are approaching your disk space **quota** limit',
      body: 'You are using 448GiB of disk out of a quota of 500GiB.',
      url: 'https://data.example.com/semaphore/v1/admin/notifications/4561-a7513',
    };

    const parsed = UserNotificationWithUrlSchema.parse(payload);
    expect(parsed).toEqual(payload);
  });

  it('allows a null read date and a null body', () => {
    const payload = {
      id: 'abc',
      created: '2026-06-12T17:10:32+00:00',
      read: null,
      sender: 'bot',
      recipient: 'user',
      summary: 'Heads up',
      body: null,
      url: 'https://data.example.com/semaphore/v1/admin/notifications/abc',
    };

    expect(() => UserNotificationWithUrlSchema.parse(payload)).not.toThrow();
  });

  it('rejects a payload missing the url field', () => {
    const payload = {
      id: 'abc',
      created: '2026-06-12T17:10:32+00:00',
      read: null,
      sender: 'bot',
      recipient: 'user',
      summary: 'Heads up',
      body: null,
    };

    expect(() => UserNotificationWithUrlSchema.parse(payload)).toThrow();
  });
});

describe('UserNotificationSchema', () => {
  it('parses a representative admin detail payload (no url)', () => {
    const payload = {
      id: '4561-a7513',
      created: '2026-06-12T17:10:32+00:00',
      read: null,
      sender: 'bot-quota-notifier',
      recipient: 'some-user',
      summary: 'You are approaching your disk space quota limit',
      body: 'You are using 448GiB of disk out of a quota of 500GiB.',
    };

    const parsed = UserNotificationSchema.parse(payload);
    expect(parsed).toEqual(payload);
  });

  it('rejects a non-ISO-8601 created date', () => {
    const payload = {
      id: '4561-a7513',
      created: 'not-a-date',
      read: null,
      sender: 'bot-quota-notifier',
      recipient: 'some-user',
      summary: 'A summary',
      body: null,
    };

    expect(() => UserNotificationSchema.parse(payload)).toThrow();
  });
});

describe('CreateUserNotificationSchema', () => {
  it('parses a representative create payload with recipient, summary, and body', () => {
    const payload = {
      recipient: 'some-user',
      summary: 'You are approaching your disk space **quota** limit',
      body: 'You are using 448GiB of disk out of a quota of 500GiB.',
    };

    const parsed = CreateUserNotificationSchema.parse(payload);
    expect(parsed).toEqual(payload);
  });

  it('parses a payload with only the required recipient and summary fields', () => {
    const payload = { recipient: 'some-user', summary: 'Heads up' };

    const parsed = CreateUserNotificationSchema.parse(payload);
    expect(parsed).toEqual(payload);
    expect(parsed.body).toBeUndefined();
  });

  it('rejects a payload missing the recipient', () => {
    expect(() =>
      CreateUserNotificationSchema.parse({ summary: 'Heads up' })
    ).toThrow();
  });

  it('rejects a payload missing the summary', () => {
    expect(() =>
      CreateUserNotificationSchema.parse({ recipient: 'some-user' })
    ).toThrow();
  });
});
