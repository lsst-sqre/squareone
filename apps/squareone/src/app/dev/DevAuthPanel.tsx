'use client';

import { gafaelfawrKeys } from '@lsst-sqre/gafaelfawr-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useId, useState } from 'react';

import { AVAILABLE_SCOPES } from '../../lib/mocks/devScopes';
import type { DevState } from '../../lib/mocks/devstate';

import styles from './DevAuthPanel.module.css';

// Persona scope presets. Admin = User plus the two admin scopes, matching the
// boot default in `src/lib/mocks/devstate.ts`.
const USER_SCOPES = ['read:tap', 'exec:notebook', 'read:image'];
const ADMIN_SCOPES = ['exec:admin', 'admin:token', ...USER_SCOPES];

type Persona = {
  id: string;
  label: string;
  loggedIn: boolean;
  scopes: string[];
};

const PERSONAS: Persona[] = [
  { id: 'anonymous', label: 'Anonymous', loggedIn: false, scopes: [] },
  { id: 'user', label: 'User', loggedIn: true, scopes: USER_SCOPES },
  { id: 'admin', label: 'Admin', loggedIn: true, scopes: ADMIN_SCOPES },
];

/** Order-independent set equality for scope lists. */
function sameScopes(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((scope) => set.has(scope));
}

/**
 * Derive the active persona from the current login state and scopes, falling
 * back to `'custom'` when the selection no longer matches a preset.
 */
function derivePersona(loggedIn: boolean, scopes: string[]): string {
  if (!loggedIn) return 'anonymous';
  const match = PERSONAS.find(
    (persona) => persona.loggedIn && sameScopes(persona.scopes, scopes)
  );
  return match?.id ?? 'custom';
}

/**
 * Dev-only auth control panel.
 *
 * Lets a developer flip the mocked Gafaelfawr session — login state, persona
 * (Anonymous / User / Admin / Custom), active scopes, and identity — at
 * runtime, so scope-gated UI (e.g. the Admin menu item and `/admin/*` pages)
 * can be exercised without a real auth backend.
 *
 * The panel reads the current state from `GET /api/dev/state` on mount and
 * writes back via the existing `POST /api/dev/login` and `POST /api/dev/logout`
 * endpoints. After applying, it invalidates the Gafaelfawr query cache so any
 * open page (and the Header) reflects the new state without a manual reload.
 *
 * It is only imported by the dev-only `/dev` route, so it is tree-shaken from
 * production builds along with the `AVAILABLE_SCOPES` helper.
 */
export default function DevAuthPanel() {
  const queryClient = useQueryClient();
  const checkboxBaseId = useId();

  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [scopes, setScopes] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  // Populate the controls from the current dev state on mount.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/dev/state')
      .then((response) => response.json() as Promise<DevState>)
      .then((state) => {
        if (cancelled) return;
        setLoggedIn(state.loggedIn);
        setUsername(state.username);
        setName(state.name);
        setScopes(state.scopes);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const activePersona = derivePersona(loggedIn, scopes);

  const applyPersona = (persona: Persona) => {
    setApplied(false);
    setLoggedIn(persona.loggedIn);
    if (persona.loggedIn) {
      setScopes(persona.scopes);
    }
  };

  const toggleScope = (scopeName: string) => {
    setApplied(false);
    setScopes((previous) =>
      previous.includes(scopeName)
        ? previous.filter((scope) => scope !== scopeName)
        : [...previous, scopeName]
    );
  };

  const handleApply = async () => {
    setApplying(true);
    setApplied(false);
    try {
      if (loggedIn) {
        await fetch('/api/dev/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, name, scopes }),
        });
      } else {
        await fetch('/api/dev/logout', { method: 'POST' });
      }
      // Refresh user-info and login-info so the Header's Admin link and any open
      // page pick up the new session without a manual reload.
      await queryClient.invalidateQueries({ queryKey: gafaelfawrKeys.all });
      setApplied(true);
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.panel}>
        <p className={styles.muted}>Loading dev state…</p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <header>
        <h1 className={styles.heading}>Dev auth control panel</h1>
        <p className={styles.muted}>
          Flip the mocked Gafaelfawr session used by the local dev server. This
          page exists only in development builds.
        </p>
      </header>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Persona</h2>
        <div className={styles.personaRow}>
          {PERSONAS.map((persona) => (
            <button
              key={persona.id}
              type="button"
              className={styles.personaButton}
              data-active={activePersona === persona.id}
              onClick={() => applyPersona(persona)}
            >
              {persona.label}
            </button>
          ))}
          {activePersona === 'custom' && (
            <span className={styles.customChip}>Custom</span>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={loggedIn}
            onChange={(event) => {
              setApplied(false);
              setLoggedIn(event.target.checked);
            }}
          />
          <span>Logged in</span>
        </label>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Identity</h2>
        <div className={styles.field}>
          <label
            className={styles.fieldLabel}
            htmlFor={`${checkboxBaseId}-username`}
          >
            Username
          </label>
          <input
            id={`${checkboxBaseId}-username`}
            className={styles.input}
            type="text"
            value={username}
            disabled={!loggedIn}
            onChange={(event) => {
              setApplied(false);
              setUsername(event.target.value);
            }}
          />
        </div>
        <div className={styles.field}>
          <label
            className={styles.fieldLabel}
            htmlFor={`${checkboxBaseId}-name`}
          >
            Display name
          </label>
          <input
            id={`${checkboxBaseId}-name`}
            className={styles.input}
            type="text"
            value={name}
            disabled={!loggedIn}
            onChange={(event) => {
              setApplied(false);
              setName(event.target.value);
            }}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Scopes</h2>
        <ul className={styles.scopeList}>
          {AVAILABLE_SCOPES.map((scope) => {
            const checkboxId = `${checkboxBaseId}-scope-${scope.name}`;
            return (
              <li key={scope.name} className={styles.scopeItem}>
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={scopes.includes(scope.name)}
                  disabled={!loggedIn}
                  onChange={() => toggleScope(scope.name)}
                />
                <label htmlFor={checkboxId} className={styles.scopeLabel}>
                  <code className={styles.scopeName}>{scope.name}</code>
                  <span className={styles.scopeDescription}>
                    {scope.description}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      <div className={styles.applyRow}>
        <button
          type="button"
          className={styles.applyButton}
          onClick={handleApply}
          disabled={applying}
        >
          {applying ? 'Applying…' : 'Apply'}
        </button>
        {applied && <span className={styles.applied}>Applied ✓</span>}
      </div>
    </div>
  );
}
