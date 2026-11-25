/*
 * Human-readable byte counts for the quotas page, in binary (1024-based)
 * units with IEC labels.
 */

/** Binary units above bytes, each 1024 times the one before. */
const UNITS = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB'];

/** Round to at most one decimal place. */
function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Format a byte count in the largest binary unit that keeps the value at
 * least one, e.g. `10737418240` as `"10 GiB"` and `1610612736` as
 * `"1.5 GiB"`.
 *
 * Values of 1024 bytes or more are scaled to `KiB`, `MiB`, `GiB`, `TiB`, or
 * `PiB` and rounded to at most one decimal place, with a trailing `.0`
 * dropped. A value that rounds up to 1024 of one unit moves up to the next
 * (`1048575` is `"1 MiB"`, not `"1024 KiB"`). Values past a PiB stay in PiB.
 *
 * Values below 1024 are shown as whole bytes: `"0 bytes"`, `"1 byte"`,
 * `"500 bytes"`.
 *
 * @param bytes - A non-negative byte count.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} ${bytes === 1 ? 'byte' : 'bytes'}`;
  }
  let unit = 0;
  let value = bytes / 1024;
  while (unit < UNITS.length - 1 && roundToTenth(value) >= 1024) {
    value /= 1024;
    unit += 1;
  }
  return `${roundToTenth(value)} ${UNITS[unit]}`;
}
