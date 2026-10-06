import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { findHighlightCss } from './check-syntax-css.js';

const scriptPath = path.join(__dirname, 'check-syntax-css.js');

let staticDir: string;

function writeFile(relativePath: string, content: string) {
  const filePath = path.join(staticDir, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
  return filePath;
}

function runCheck(dir: string) {
  return spawnSync(process.execPath, [scriptPath, dir], { encoding: 'utf8' });
}

beforeEach(() => {
  staticDir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-syntax-css-'));
});

afterEach(() => {
  fs.rmSync(staticDir, { recursive: true, force: true });
});

describe('findHighlightCss', () => {
  it('returns the nested CSS files that carry a ::highlight() rule', () => {
    writeFile('chunks/base.css', 'body{margin:0}');
    const syntax = writeFile(
      'chunks/nested/syntax.css',
      '::highlight(keyword){color:var(--syntax-keyword)}'
    );

    expect(findHighlightCss(staticDir)).toEqual([syntax]);
  });

  it('ignores non-CSS files that mention ::highlight()', () => {
    writeFile('chunks/base.css', 'body{margin:0}');
    writeFile('chunks/app.js', 'const rule = "::highlight(keyword){}";');

    expect(findHighlightCss(staticDir)).toEqual([]);
  });
});

describe('check-syntax-css CLI', () => {
  it('passes when an emitted stylesheet carries a ::highlight() rule', () => {
    writeFile('chunks/syntax.css', '::highlight(string){color:red}');

    const result = runCheck(staticDir);

    expect(result.status).toBe(0);
  });

  it('fails with a clear message when no stylesheet carries the rules', () => {
    writeFile('chunks/base.css', 'body{margin:0}');

    const result = runCheck(staticDir);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('::highlight(');
    expect(result.stderr).toContain('syntax.css');
  });

  it('fails when the static output directory does not exist', () => {
    const result = runCheck(path.join(staticDir, 'missing'));

    expect(result.status).toBe(2);
    expect(result.stderr).toContain('not found');
  });
});
