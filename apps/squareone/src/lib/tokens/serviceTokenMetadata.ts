import type { Group } from '@lsst-sqre/gafaelfawr-client';

/**
 * Raw "Advanced metadata" form fields, as collected by `ServiceTokenForm`'s
 * text inputs. Everything is a string until {@link parseServiceTokenMetadata}
 * converts the supplied values to their typed form.
 */
export type ServiceTokenMetadataInput = {
  name: string;
  email: string;
  uid: string;
  gid: string;
  groups: string;
};

/**
 * Parsed optional identity metadata for a service-token request.
 *
 * Each field is present only when the operator supplied it, so the object can
 * be spread straight into the `AdminTokenRequest` body — omitted fields are
 * absent from the request rather than sent as blank values.
 */
export type ServiceTokenMetadata = {
  name?: string;
  email?: string;
  uid?: number;
  gid?: number;
  groups?: Group[];
};

/**
 * Validate an optional numeric identity field (UID or GID).
 *
 * Returns `null` when the field is empty (it is optional) or a valid positive
 * integer, otherwise a clear error message naming the field.
 */
export function validateIdField(value: string, label: string): string | null {
  const trimmed = value.trim();
  if (trimmed === '') {
    return null;
  }
  if (!/^\d+$/.test(trimmed) || Number.parseInt(trimmed, 10) < 1) {
    return `${label} must be a positive integer.`;
  }
  return null;
}

const GROUPS_ERROR_MESSAGE =
  'Each group must be "name:id" with a positive integer id ' +
  '(one per line or comma-separated).';

/**
 * Split a raw groups field into its individual `name:id` entries, dropping
 * blank entries. Entries may be separated by newlines and/or commas.
 */
function splitGroupEntries(value: string): string[] {
  return value
    .split(/[\n,]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry !== '');
}

/**
 * Parse a single `name:id` entry into a {@link Group}, or `null` when it is
 * malformed.
 */
function parseGroupEntry(entry: string): Group | null {
  const colonIndex = entry.indexOf(':');
  if (colonIndex === -1) {
    return null;
  }
  const name = entry.slice(0, colonIndex).trim();
  const idRaw = entry.slice(colonIndex + 1).trim();
  if (name === '' || !/^\d+$/.test(idRaw)) {
    return null;
  }
  const id = Number.parseInt(idRaw, 10);
  if (id < 1) {
    return null;
  }
  return { name, id };
}

/**
 * Validate the optional groups field. Returns `null` when empty or when every
 * entry is a well-formed `name:id` pair, otherwise an error message.
 */
export function validateGroupsField(value: string): string | null {
  for (const entry of splitGroupEntries(value)) {
    if (parseGroupEntry(entry) === null) {
      return GROUPS_ERROR_MESSAGE;
    }
  }
  return null;
}

/**
 * Parse a raw groups field into an array of {@link Group} objects, skipping any
 * malformed entries.
 */
export function parseGroups(value: string): Group[] {
  return splitGroupEntries(value)
    .map(parseGroupEntry)
    .filter((group): group is Group => group !== null);
}

/**
 * Convert raw "Advanced metadata" form fields into the typed metadata object
 * sent with a service-token request.
 *
 * Only fields the operator actually supplied are included, so omitted fields
 * never appear in the resulting `AdminTokenRequest` body.
 */
export function parseServiceTokenMetadata(
  input: ServiceTokenMetadataInput
): ServiceTokenMetadata {
  const metadata: ServiceTokenMetadata = {};

  const name = input.name.trim();
  if (name !== '') {
    metadata.name = name;
  }

  const email = input.email.trim();
  if (email !== '') {
    metadata.email = email;
  }

  const uid = input.uid.trim();
  if (/^\d+$/.test(uid) && Number.parseInt(uid, 10) >= 1) {
    metadata.uid = Number.parseInt(uid, 10);
  }

  const gid = input.gid.trim();
  if (/^\d+$/.test(gid) && Number.parseInt(gid, 10) >= 1) {
    metadata.gid = Number.parseInt(gid, 10);
  }

  const groups = parseGroups(input.groups);
  if (groups.length > 0) {
    metadata.groups = groups;
  }

  return metadata;
}
