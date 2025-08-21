#################################
COmanage enrollment landing pages
#################################

Squareone supports COmanage Registry by providing pages that can be configured as URL callbacks for various stages of the enrollement workflow.

.. mermaid:: comanage-flow.mmd

The content for each page is :doc:`written as MDX <writing-mdx>` and loaded from MDX files at paths relative to the ``mdxDir`` configuration (defaults to ``src/content/pages`` in development).

.. list-table::
   :header-rows: 1

   * - URL
     - MDX file path
     - Purpose
   * - ``/enrollment/thanks-for-signing-up``
     - ``enrollment__thanks-for-signing-up.mdx``
     - Direct user to verify email receipt
   * - ``/enrollment/thanks-for-verifying``
     - ``enrollment__thanks-for-verifying.mdx``
     - Email verified, approval pending.
   * - ``/enrollment/pending-confirmation``
     - ``enrollment__pending-confirmation.mdx``
     - Email still pending verification.
   * - ``/enrollment/pending-approval``
     - ``enrollment__pending-approval.mdx``
     - Email verified, approval still pending.
