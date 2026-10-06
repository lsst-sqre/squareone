import { describe, expect, it } from 'vitest';
import * as squared from '../../index';
import CodeBlock from './CodeBlock';

describe('squared package exports', () => {
  it('exports CodeBlock from the package index', () => {
    expect(squared.CodeBlock).toBe(CodeBlock);
  });
});
