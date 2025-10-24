########################
Turborepo remote caching
########################

This page provides detailed information about the Turborepo remote cache authentication system used in the Squareone monorepo.
For setup instructions, see the :ref:`Turborepo remote caching <set-up-turborepo-cache>` section of the :doc:`set-up` guide.

Overview
========

The Squareone monorepo uses a custom Turborepo cache server at ``https://roundtable.lsst.cloud/turborepo-cache`` to provide remote caching for faster builds.
The cache server is deployed on Roundtable and uses Gafaelfawr for authentication.

A wrapper script (:file:`scripts/turbo-wrapper.js`) intelligently detects and uses available authentication methods, allowing the monorepo to support multiple workflows:

- **External contributors**: No authentication needed, uses local cache only
- **Maintainers with 1Password**: Secure credential management via 1Password CLI
- **Maintainers or environments without 1Password**: Plain :file:`.env` file support

All pnpm scripts that use Turborepo (``pnpm build``, ``pnpm dev``, ``pnpm test``, etc.) automatically use the wrapper script, so authentication is transparent once configured.

Authentication priority
=======================

The wrapper script checks for authentication in this order:

1. **1Password** (:file:`.env.op` file present + ``op`` CLI available)
2. **Plain environment** (:file:`.env` file present)
3. **No authentication** (fallback to local cache only)

This ensures maintainers with 1Password get secure credential management, while other users can still access the remote cache or work offline without any issues.

Verifying remote cache
======================

When running Turborepo commands, you'll see a message indicating which authentication method is active:

- ✅ ``🔐 Using 1Password for Turborepo remote cache authentication`` - 1Password method active
- ✅ ``🔑 Using .env for Turborepo remote cache authentication`` - Plain .env method active
- ℹ️ ``ℹ️ Running Turborepo without remote cache (local cache only)`` - No authentication, local cache only

You can also verify remote cache hits in the Turborepo output. Look for messages like:

.. code-block:: text

   >>> FULL TURBO
   >>> Remote caching enabled

And cache hit indicators for individual packages.

Obtaining access tokens
=======================

To get a personal access token for the remote cache:

1. Visit https://roundtable.lsst.cloud
2. Log in with your credentials
3. Navigate to the token management page
4. Create a new token with the ``write:git-lfs`` scope
5. Store it securely in 1Password or your :file:`.env` file (never commit it to Git)

The token is a Gafaelfawr user access token that authorizes access to the Turborepo cache server.

Security notes
==============

- **Never commit .env or .env.op files** - they are in :file:`.gitignore`
- Use :file:`.env.example` and :file:`.env.op.example` as templates
- 1Password method is preferred for personal machines (unencrypted credentials never touch disk)
- Plain :file:`.env` method is suitable for environments without the 1Password CLI
- External contributors can work effectively without any remote cache access

Troubleshooting
===============

1Password CLI not available
---------------------------

If you see this warning but have 1Password installed:

.. code-block:: bash

   # Verify installation
   op --version

   # If not installed
   brew install 1password-cli

   # Sign in
   op signin lsstit.1password.com

Remote cache not working
------------------------

1. Verify your credentials are correct
2. Check network connectivity to https://roundtable.lsst.cloud
3. Ensure your token hasn't expired
4. Try running with ``TURBO_LOG_LEVEL=debug`` for more information:

   .. code-block:: bash

      TURBO_LOG_LEVEL=debug pnpm build

Want to temporarily disable remote cache
----------------------------------------

Remove or rename :file:`.env` or :file:`.env.op` files, or run turbo directly:

.. code-block:: bash

   npx turbo build  # Bypasses wrapper, uses local cache only

You can also use the ``build:local`` script:

.. code-block:: bash

   pnpm build:local  # Uses local cache only

Infrastructure
==============

The Turborepo cache server is deployed as part of the Rubin Science Platform infrastructure.
For more information about the cache server deployment, configuration, and operations, see the `Phalanx turborepo-cache application documentation <https://phalanx.lsst.io/applications/turborepo-cache/index.html>`_.

The cache server uses:

- https://github.com/lsst-sqre/turborepo-cache-proxy as a proxy to exchange the Gafaelfawr token for the cache server's internal authentication
- https://github.com/ducktors/turborepo-remote-cache as the actual cache server implementation
- Google Cloud Storage as the backend storage for cached artifacts
