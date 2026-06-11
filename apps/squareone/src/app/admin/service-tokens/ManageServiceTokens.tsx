'use client';

import { Button, FormField } from '@lsst-sqre/squared';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import styles from './ManageServiceTokens.module.css';

/**
 * Bot-username lookup that hands off to the dedicated `/search` page.
 *
 * The landing keeps the lookup box + "Look up tokens" button as a quick entry
 * point, but the token list itself lives on `/admin/service-tokens/search`,
 * whose `?q=` URL param is the single source of truth for the looked-up bot
 * user (so a lookup can be bookmarked, shared, and back-navigated). On submit
 * this navigates to that page with the trimmed entry as `?q=`; validation and
 * the listing happen there.
 */
export default function ManageServiceTokens() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    // Keep the trim so a padded entry produces a clean `?q=`; the `/search`
    // page owns bot-username validation, so the landing does none of its own.
    const username = inputValue.trim();
    router.push(
      `/admin/service-tokens/search?q=${encodeURIComponent(username)}`
    );
  };

  return (
    <div>
      <p>Look up and revoke an existing bot user&rsquo;s service tokens.</p>

      <form onSubmit={handleSubmit}>
        <FormField>
          <FormField.Label htmlFor="manage-bot-user">Bot user</FormField.Label>
          <div className={styles.inputRow}>
            <FormField.TextInput
              id="manage-bot-user"
              className={styles.input}
              placeholder="bot-example"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              autoComplete="off"
              data-1p-ignore
              data-form-type="other"
            />
            <Button type="submit">Look up tokens</Button>
          </div>
        </FormField>
      </form>
    </div>
  );
}
