'use client';

import { useLoginInfo } from '@lsst-sqre/gafaelfawr-client';
import { useCreateAdminNotification } from '@lsst-sqre/semaphore-client';
import { Note } from '@lsst-sqre/squared';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import NotificationForm, {
  type NotificationFormInitialValues,
  type NotificationFormValues,
} from '../../../../components/NotificationForm';
import { useRepertoireUrl } from '../../../../hooks/useRepertoireUrl';
import { useSemaphoreUrl } from '../../../../hooks/useSemaphoreUrl';

/**
 * Semaphore scope required to create notifications via the admin
 * `POST /semaphore/v1/admin/notifications` endpoint.
 */
const NOTIFICATIONS_ADMIN_SCOPE = 'admin:notifications';

/**
 * Where to return after a successful (non-"draft another") send or a cancel.
 */
const LANDING_URL = '/admin/notifications';

/**
 * Client component for the `/admin/notifications/new` compose page.
 *
 * Wires the presentational {@link NotificationForm} to
 * {@link useCreateAdminNotification}, sourcing the CSRF token from Gafaelfawr
 * login info and the Semaphore base URL from Repertoire discovery. Query
 * parameters (`recipient`, `summary`, `body`) pre-fill the form so notifications
 * can be drafted from operational run books.
 *
 * The page sits behind the `exec:admin` gate inherited from the admin layout and
 * additionally checks `loginInfo.scopes` for `admin:notifications` — without it,
 * an explanatory `Note` is shown and the form is disabled rather than letting a
 * submit fail with a silent 403.
 *
 * On submit: when "draft another" is checked the form stays put, clears, and
 * shows its own success confirmation; when unchecked the page redirects to the
 * listing. A failed send surfaces as an inline error in the form (the rejected
 * mutation propagates back through `onSubmit`).
 */
export default function NewNotificationPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const repertoireUrl = useRepertoireUrl();
  const semaphoreUrl = useSemaphoreUrl();

  const {
    loginInfo,
    csrfToken,
    error: loginError,
    isLoading: loginLoading,
  } = useLoginInfo(repertoireUrl);

  const createNotification = useCreateAdminNotification(semaphoreUrl ?? '');

  // Parse query parameters for form prefilling. Only params actually present
  // populate fields; omitted ones keep the form's empty defaults.
  const formInitialValues: NotificationFormInitialValues = {};

  const recipientParam = searchParams.get('recipient');
  if (recipientParam) {
    formInitialValues.recipient = recipientParam;
  }

  const summaryParam = searchParams.get('summary');
  if (summaryParam) {
    formInitialValues.summary = summaryParam;
  }

  const bodyParam = searchParams.get('body');
  if (bodyParam) {
    formInitialValues.body = bodyParam;
  }

  const handleSubmit = async (values: NotificationFormValues) => {
    if (!csrfToken) {
      // Surfaced as an inline error in the form rather than a silent failure.
      throw new Error('CSRF token not available. Please log in again.');
    }

    await createNotification.mutateAsync({
      notification: {
        recipient: values.recipient,
        summary: values.summary,
        // Only include the body when the operator supplied one.
        ...(values.body !== undefined ? { body: values.body } : {}),
      },
      csrfToken,
    });

    // On the "draft another" path the form stays put and confirms inline; only
    // the unchecked path navigates back to the listing.
    if (!values.draftAnother) {
      router.push(LANDING_URL);
    }
  };

  const handleCancel = () => {
    router.push(LANDING_URL);
  };

  let content: React.ReactNode;
  if (loginLoading) {
    content = <p>Loading…</p>;
  } else if (loginError || !loginInfo) {
    content = (
      <p>
        Failed to load authentication information. Please refresh the page or
        log in again.
      </p>
    );
  } else {
    // The page stays inside the `exec:admin` admin section, but sending a
    // notification additionally requires the `admin:notifications` scope. When
    // it is absent we explain why and disable the form rather than letting a
    // submit fail with a silent 403.
    const hasAdminNotifications = loginInfo.scopes.includes(
      NOTIFICATIONS_ADMIN_SCOPE
    );

    content = (
      <>
        {!hasAdminNotifications && (
          <Note type="warning">
            <p>
              You do not have the <code>{NOTIFICATIONS_ADMIN_SCOPE}</code>{' '}
              scope, which is required to send notifications. The form below is
              disabled. Ask an administrator to grant you the{' '}
              <code>{NOTIFICATIONS_ADMIN_SCOPE}</code> scope.
            </p>
          </Note>
        )}
        <NotificationForm
          initialValues={formInitialValues}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createNotification.isPending}
          disabled={!hasAdminNotifications}
        />
      </>
    );
  }

  return (
    <div>
      <h1>Send a notification</h1>
      <p>
        Send a Markdown-formatted notification to a Rubin Science Platform user.
      </p>

      {content}
    </div>
  );
}
