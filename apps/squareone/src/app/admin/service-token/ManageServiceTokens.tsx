'use client';

import { Button, FormField } from '@lsst-sqre/squared';
import React, { useState } from 'react';

import AccessTokensView from '../../../components/AccessTokensView';
import { validateBotUsername } from '../../../lib/tokens/botUsername';

/**
 * Look up and revoke an individual `bot-` user's Gafaelfawr service tokens.
 *
 * A bot-username lookup (validated with {@link validateBotUsername}, the same
 * helper the creation form uses) drives a service-scoped {@link AccessTokensView}
 * once a valid username is submitted. An invalid or non-`bot-` username is
 * rejected with a clear message and issues no request, because the view — the
 * only caller of `useUserTokens` here — is mounted only after a valid lookup.
 *
 * Listing is always per looked-up bot username: Gafaelfawr exposes no global
 * token/user enumeration. Revoking a token (via the view's `DeleteTokenModal` +
 * `useDeleteToken`) invalidates the bot user's token list, so the list refreshes
 * automatically afterwards.
 */
export default function ManageServiceTokens() {
  const [inputValue, setInputValue] = useState('');
  const [lookupError, setLookupError] = useState<string | null>(null);
  // The validated username currently being managed. Null until a valid lookup,
  // so no token request is issued for an empty or invalid entry.
  const [lookedUpUsername, setLookedUpUsername] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const username = inputValue.trim();
    const error = validateBotUsername(username);
    if (error) {
      setLookupError(error);
      // Clear any previously listed tokens so the rejected entry shows no list.
      setLookedUpUsername(null);
      return;
    }

    setLookupError(null);
    setLookedUpUsername(username);
  };

  return (
    <div>
      <p>Look up and revoke an existing bot user&rsquo;s service tokens.</p>

      <form onSubmit={handleSubmit}>
        <FormField error={lookupError ?? undefined}>
          <FormField.Label htmlFor="manage-bot-user">Bot user</FormField.Label>
          <FormField.TextInput
            id="manage-bot-user"
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

      {lookedUpUsername && (
        <AccessTokensView
          username={lookedUpUsername}
          tokenType="service"
          emptyState={
            <p>
              No service tokens found for <code>{lookedUpUsername}</code>.
            </p>
          }
        />
      )}
    </div>
  );
}
