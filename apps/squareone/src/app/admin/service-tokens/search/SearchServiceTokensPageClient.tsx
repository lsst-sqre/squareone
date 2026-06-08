'use client';

import { Button, FormField } from '@lsst-sqre/squared';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import AccessTokensView from '../../../../components/AccessTokensView';
import { validateBotUsername } from '../../../../lib/tokens/botUsername';

const LANDING_URL = '/admin/service-tokens';
const NEW_URL = `${LANDING_URL}/new`;
const SEARCH_URL = `${LANDING_URL}/search`;

/**
 * Client component for the `/admin/service-tokens/search` admin page.
 *
 * Token lookup is driven entirely by the `?q=` URL param, which is the single
 * source of truth for the looked-up bot user — so an admin can bookmark or
 * share a lookup and switch bot users by editing the URL. The search box is
 * seeded from `?q=` (and stays in sync with it through back/forward
 * navigation); submitting it `router.push`es a new `?q=` history entry rather
 * than mutating local state.
 *
 * Results derive from `q`: an empty `q` prompts for a username and issues no
 * request; an invalid / non-`bot-` `q` shows an inline error and issues no
 * request; a valid `q` lists that bot user's **service** tokens via
 * {@link AccessTokensView} with no per-token details link (the
 * `/settings/tokens/<key>` route does not resolve for service tokens).
 *
 * The page sits behind the `exec:admin` gate inherited from the admin layout.
 */
export default function SearchServiceTokensPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // `q` is the single source of truth driving the results. Trim defensively so
  // a hand-edited URL with stray whitespace validates like a landing redirect.
  const q = (searchParams.get('q') ?? '').trim();

  // The box is seeded from `q` and re-synced whenever `q` changes (e.g. the
  // landing redirect or a back/forward navigation), but is otherwise free to
  // edit locally until the next submit.
  const [inputValue, setInputValue] = useState(q);
  useEffect(() => {
    setInputValue(q);
  }, [q]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = inputValue.trim();
    router.push(`${SEARCH_URL}?q=${encodeURIComponent(trimmed)}`);
  };

  // Only a non-empty, invalid entry is an error; an empty `q` gets the prompt.
  const qError = q === '' ? null : validateBotUsername(q);
  const qIsValid = q !== '' && qError === null;

  // Pre-fill the creation form with the current bot user when it is valid.
  const createHref = qIsValid
    ? `${NEW_URL}?username=${encodeURIComponent(q)}`
    : NEW_URL;

  let results: React.ReactNode;
  if (q === '') {
    results = <p>Enter a bot username to look up its service tokens.</p>;
  } else if (qIsValid) {
    results = (
      <AccessTokensView
        username={q}
        tokenType="service"
        showDetailsLink={false}
        emptyState={
          <p>
            No service tokens found for <code>{q}</code>.
          </p>
        }
      />
    );
  } else {
    // Invalid `q`: the error is shown under the box via the FormField below.
    results = null;
  }

  return (
    <div>
      <h1>Look up service tokens</h1>
      <p>
        Look up and revoke an existing bot user&rsquo;s service tokens, or{' '}
        <Link href={createHref}>create a new service token</Link>.
      </p>

      <form onSubmit={handleSubmit}>
        <FormField error={qError ?? undefined}>
          <FormField.Label htmlFor="search-bot-user">Bot user</FormField.Label>
          <FormField.TextInput
            id="search-bot-user"
            placeholder="bot-example"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            autoComplete="off"
            data-1p-ignore
            data-form-type="other"
          />
        </FormField>
        <Button type="submit">Look up tokens</Button>
      </form>

      {results}
    </div>
  );
}
