#################################
COmanage enrollment landing pages
#################################

Squareone supports COmanage Registry by providing pages that can be configured as URL callbacks for various stages of the enrollement workflow.

.. mermaid:: comanage-flow.mmd

The content for each page is configurable through :doc:`squareone.config.yaml <config-ref>`, and is :doc:`written as MDX <writing-mdx>`.

.. list-table::
   :header-rows: 1

   * - URL
     - Content config
     - Purpose
   * - ``/enrollment/thanks-for-signing-up``
     - ``verifyEmailPageMdx``
     - Direct user to verify email receipt
   * - ``/enrollment/thanks-for-verifying``
     - ``emailVerifiedPageMdx``
     - Email verified, approval pending.
   * - ``/enrollment/pending-confirmation``
     - ``pendingVerificationPageMdx``
     - Email still pending verification.
   * - ``/enrollment/pending-approval``
     - ``pendingApprovalPageMdx``
     - Email verified, approval still pending.
