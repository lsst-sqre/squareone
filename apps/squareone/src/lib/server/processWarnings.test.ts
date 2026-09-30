import pino from 'pino';
import { afterEach, describe, expect, it } from 'vitest';

import { installProcessWarningLogger } from './processWarnings';

type LogRecord = Record<string, unknown> & {
  level: number;
  msg?: string;
  err?: Record<string, unknown>;
};

/**
 * A real pino logger whose JSON records are collected in memory, so a test
 * sees each record exactly as pino (and the Sentry pino bridge) would.
 */
function createCapturingLogger() {
  const records: LogRecord[] = [];
  const logger = pino(
    { level: 'debug' },
    {
      write(line: string) {
        records.push(JSON.parse(line));
      },
    }
  );
  return { logger, records };
}

/**
 * Emit a process warning and wait until Node has dispatched it to the
 * `warning` listeners (`process.emitWarning` defers the event to the next
 * tick).
 */
async function emitWarning(...args: Parameters<typeof process.emitWarning>) {
  const dispatched = new Promise((resolve) => {
    process.once('warning', resolve);
  });
  process.emitWarning(...args);
  await dispatched;
}

const WARN = pino.levels.values.warn;

let uninstall: (() => void) | undefined;

afterEach(() => {
  uninstall?.();
  uninstall = undefined;
});

describe('installProcessWarningLogger', () => {
  it('logs a process warning as one pino warn record', async () => {
    const { logger, records } = createCapturingLogger();
    uninstall = installProcessWarningLogger(logger);

    await emitWarning('probe', { type: 'ProbeWarning', code: 'SQ_PROBE' });

    expect(records).toHaveLength(1);
    const [record] = records;
    expect(record.level).toBe(WARN);
    expect(record.msg).toBe('probe');
    expect(record.warningName).toBe('ProbeWarning');
    expect(record.warningCode).toBe('SQ_PROBE');
    expect(record.err).toMatchObject({
      message: 'probe',
      stack: expect.stringContaining('ProbeWarning: probe'),
    });
  });

  it('logs a warning that has no code', async () => {
    const { logger, records } = createCapturingLogger();
    uninstall = installProcessWarningLogger(logger);

    await emitWarning('probe');

    expect(records).toHaveLength(1);
    const [record] = records;
    expect(record.msg).toBe('probe');
    expect(record.warningName).toBe('Warning');
    expect(record).not.toHaveProperty('warningCode');
    expect(record.err).toMatchObject({ message: 'probe' });
  });

  it('registers one listener when installed twice', async () => {
    const { logger, records } = createCapturingLogger();
    const listenersBefore = process.listenerCount('warning');

    uninstall = installProcessWarningLogger(logger);
    const second = installProcessWarningLogger(logger);

    expect(second).toBe(uninstall);
    expect(process.listenerCount('warning')).toBe(listenersBefore + 1);
    await emitWarning('probe');
    expect(records).toHaveLength(1);
  });

  it('stops logging once uninstalled', async () => {
    const { logger, records } = createCapturingLogger();
    const listenersBefore = process.listenerCount('warning');

    installProcessWarningLogger(logger)();

    expect(process.listenerCount('warning')).toBe(listenersBefore);
    await emitWarning('probe');
    expect(records).toHaveLength(0);
  });

  it.each([
    ['a string', 'plain text warning', 'plain text warning'],
    ['a plain object', { message: 'object warning' }, 'object warning'],
    ['null', null, 'null'],
  ])('logs a non-Error warning (%s) without throwing', (_, warning, msg) => {
    const { logger, records } = createCapturingLogger();
    const listenersBefore = process.listeners('warning');
    uninstall = installProcessWarningLogger(logger);
    const [listener] = process
      .listeners('warning')
      .filter((existing) => !listenersBefore.includes(existing));

    // Node only emits Error warnings itself, but any code can emit `warning`
    // with an arbitrary value. The listener is called directly because Vitest
    // wraps process.emit to filter warnings, and its wrapper throws on null.
    expect(() => listener(warning as unknown as Error)).not.toThrow();

    expect(records).toHaveLength(1);
    expect(records[0].level).toBe(WARN);
    expect(records[0].msg).toBe(msg);
  });
});
