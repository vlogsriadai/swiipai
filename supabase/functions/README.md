# SwiipAI Edge Functions

The included functions demonstrate the security boundary used by every privileged workflow:
authentication, schema validation, server-side pricing, atomic credit reservation, idempotency and
fail-closed payment verification.

Create separate functions for the production routes below by reusing `_shared/core.ts`:

- `check-generation-status`, `cancel-generation`, `provider-callback`,
  `process-generation-result`, `refund-failed-generation`
- `stripe-create-checkout`, `stripe-create-portal`, `stripe-webhook`
- `paypal-create-order`, `paypal-capture-order`, `paypal-webhook`
- `youcan-create-payment`, `youcan-payment-callback`, `youcan-payment-webhook`,
  `youcan-check-payment`
- `create-api-key`, `revoke-api-key`, `admin-adjust-credits`, `admin-refund-payment`
- `send-transactional-email`, `generate-signed-download`, `delete-user-account`

Never enable a payment provider until its current official signature-verification flow has
passing sandbox tests. Redirect URLs do not prove payment. Mock generation must never fulfil
orders, award credits or call a live provider.
