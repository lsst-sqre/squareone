import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';

import OIDCClientForm from './OIDCClientForm';

const meta: Meta<typeof OIDCClientForm> = {
  title: 'Components/OIDCClientForm',
  component: OIDCClientForm,
  parameters: {
    layout: 'padded',
  },
  args: {
    onSubmit: async () => {},
    isSubmitting: false,
    disabled: false,
  },
  // Run these stories as interaction tests in the `storybook` vitest project.
  tags: ['test'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The create form an admin holding the OIDC admin scope sees at
 * `/admin/oidc-clients/new`: an empty form whose submit registers a client.
 */
export const Create: Story = {
  args: {
    mode: 'create',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText(/return uri/i)).toBeEnabled();
    await expect(canvas.getByLabelText(/description/i)).toBeEnabled();
    await expect(canvas.getByLabelText(/notes/i)).toBeEnabled();
    await expect(
      canvas.getByRole('button', { name: /create client/i })
    ).toBeEnabled();
  },
};

/**
 * The same form in edit mode, seeded with an existing client's state. Gafaelfawr
 * requires `return_uri` and `description` on its PATCH too, so an edit sends the
 * whole updatable state rather than a sparse diff — which is why one form serves
 * both flows.
 */
export const Edit: Story = {
  args: {
    mode: 'edit',
    defaultValues: {
      return_uri: 'https://chronograf.example.org/oauth/callback',
      description: 'Chronograf dashboards',
      notes: 'Owned by the SQuaRE team; rotate before the next release.',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText(/return uri/i)).toHaveValue(
      'https://chronograf.example.org/oauth/callback'
    );
    await expect(
      canvas.getByRole('button', { name: /save changes/i })
    ).toBeEnabled();
  },
};

/**
 * Gated state shown to an admin lacking the configured OIDC admin scope: every
 * field and the submit button are disabled. The explanatory `Note` lives on the
 * page alongside this disabled form.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText(/return uri/i)).toBeDisabled();
    await expect(canvas.getByLabelText(/description/i)).toBeDisabled();
    await expect(canvas.getByLabelText(/notes/i)).toBeDisabled();
    await expect(
      canvas.getByRole('button', { name: /create client/i })
    ).toBeDisabled();
  },
};

/**
 * Client-side validation: a relative return URI never reaches Gafaelfawr,
 * because a redirect target without a scheme is meaningless outside the browser
 * that typed it.
 */
export const ValidationError: Story = {
  name: 'Validation error',
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByLabelText(/return uri/i),
      '/oauth/callback'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: /create client/i })
    );

    await expect(
      await canvas.findByText(/return uri must be an absolute url, including/i)
    ).toBeVisible();
    // The missing description is reported in the same pass.
    await expect(
      await canvas.findByText(/description is required/i)
    ).toBeVisible();
  },
};

/**
 * A rejected submit — here Gafaelfawr's 422 about the return URI — surfaces
 * inline with the server's own message and, crucially, without discarding the
 * operator's input, so the offending field can be corrected in place.
 */
export const SubmitError: Story = {
  name: 'Submit error',
  args: {
    onSubmit: async () => {
      throw new Error('body.return_uri: URL scheme not permitted');
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.type(
      canvas.getByLabelText(/return uri/i),
      'ftp://app.example.org/callback'
    );
    await userEvent.type(
      canvas.getByLabelText(/description/i),
      'Example relying party'
    );
    await userEvent.click(
      canvas.getByRole('button', { name: /create client/i })
    );

    await expect(
      await canvas.findByText(/url scheme not permitted/i)
    ).toBeInTheDocument();
    await expect(canvas.getByLabelText(/description/i)).toHaveValue(
      'Example relying party'
    );
  },
};

/**
 * The create form under the dark theme, so the adaptive `--rsd-component-*`
 * tokens (labels, help text, error text) stay verifiable there too.
 */
export const Dark: Story = {
  globals: {
    theme: 'dark',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText(/return uri/i)).toBeEnabled();
  },
};
