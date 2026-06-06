import { describe, expect, it } from 'vitest';
import {
  parseGroups,
  parseServiceTokenMetadata,
  validateGroupsField,
  validateIdField,
} from './serviceTokenMetadata';

const emptyInput = {
  name: '',
  email: '',
  uid: '',
  gid: '',
  groups: '',
};

describe('parseServiceTokenMetadata', () => {
  it('returns an empty object when no fields are supplied', () => {
    expect(parseServiceTokenMetadata(emptyInput)).toEqual({});
  });

  it('includes only the fields that were supplied', () => {
    expect(
      parseServiceTokenMetadata({ ...emptyInput, name: 'CI Bot' })
    ).toEqual({ name: 'CI Bot' });
  });

  it('parses uid and gid into numbers', () => {
    expect(
      parseServiceTokenMetadata({ ...emptyInput, uid: '90000', gid: '90001' })
    ).toEqual({ uid: 90000, gid: 90001 });
  });

  it('parses groups into name/id objects', () => {
    expect(
      parseServiceTokenMetadata({
        ...emptyInput,
        groups: 'g_developers:1001\ng_ops:1002',
      })
    ).toEqual({
      groups: [
        { name: 'g_developers', id: 1001 },
        { name: 'g_ops', id: 1002 },
      ],
    });
  });

  it('trims whitespace and omits fields that are blank after trimming', () => {
    expect(
      parseServiceTokenMetadata({
        ...emptyInput,
        name: '   ',
        email: '  ci@example.com  ',
      })
    ).toEqual({ email: 'ci@example.com' });
  });

  it('includes every field when all are supplied', () => {
    expect(
      parseServiceTokenMetadata({
        name: 'CI Bot',
        email: 'ci@example.com',
        uid: '90000',
        gid: '90001',
        groups: 'g_developers:1001',
      })
    ).toEqual({
      name: 'CI Bot',
      email: 'ci@example.com',
      uid: 90000,
      gid: 90001,
      groups: [{ name: 'g_developers', id: 1001 }],
    });
  });
});

describe('validateIdField', () => {
  it('accepts an empty value because the field is optional', () => {
    expect(validateIdField('', 'UID')).toBeNull();
  });

  it('accepts a positive integer', () => {
    expect(validateIdField('90000', 'UID')).toBeNull();
  });

  it('rejects a non-numeric value and names the field in the message', () => {
    const error = validateIdField('abc', 'UID');
    expect(error).not.toBeNull();
    expect(error).toContain('UID');
  });

  it('rejects zero and negative values', () => {
    expect(validateIdField('0', 'GID')).not.toBeNull();
    expect(validateIdField('-5', 'GID')).not.toBeNull();
  });
});

describe('validateGroupsField', () => {
  it('accepts an empty value', () => {
    expect(validateGroupsField('')).toBeNull();
  });

  it('accepts well-formed name:id entries', () => {
    expect(validateGroupsField('g_developers:1001, g_ops:1002')).toBeNull();
  });

  it('rejects an entry that is missing the id', () => {
    expect(validateGroupsField('g_developers')).not.toBeNull();
  });

  it('rejects an entry whose id is not a positive integer', () => {
    expect(validateGroupsField('g_developers:abc')).not.toBeNull();
    expect(validateGroupsField('g_developers:0')).not.toBeNull();
  });
});

describe('parseGroups', () => {
  it('splits on newlines and commas, skipping blank entries', () => {
    expect(parseGroups('g_developers:1001\n, g_ops:1002\n')).toEqual([
      { name: 'g_developers', id: 1001 },
      { name: 'g_ops', id: 1002 },
    ]);
  });

  it('returns an empty array for blank input', () => {
    expect(parseGroups('')).toEqual([]);
  });
});
