# SwiipAI

SwiipAI is a responsive, original AI-creation SaaS interface with three complete product areas:
the public marketing site, the creator workspace and a separate administration console.

## Included

- Public homepage, feature pages, explore, pricing, legal, help and developer surfaces
- Sign-in, registration, verification and password recovery flows
- Creator dashboard and video, image, audio, motion, lip-sync and effects workspaces
- Projects, assets, history, collections, community, billing, credits and settings
- Admin analytics, users, jobs, models, providers, plans, payments, CMS, moderation and support
- Supabase schema, RLS policies, seed data, atomic credit reservation and Edge Function examples
- Responsive dark product UI, light marketing mode and reduced-motion accessibility

## Local development

1. Install Node.js 22 or newer.
2. Run `npm install`.
3. Copy `.env.example` to `.env.local` and fill only the public Supabase values needed by the browser.
4. Run `npm run dev`.
5. Open the local URL printed by the development server.

The interface runs safely in mock mode without credentials. In mock mode no real credits are
charged and no payment is marked as successful.

## Supabase setup

1. Create development, staging and production Supabase projects.
2. Run `supabase/migrations/0001_swiipai_core.sql`.
3. Run `supabase/seed.sql`.
4. Create the storage buckets listed in the master specification and keep user media private.
5. Add server-only secrets through Supabase secrets, never through the frontend.
6. Deploy each Edge Function after provider-specific sandbox tests pass.
7. Create the first Super Admin role assignment directly through a protected server-side operation.

## Payments

Stripe, PayPal and YouCan Pay remain disabled until their server-only credentials, current webhook
verification adapters and sandbox tests are complete. A successful redirect is never treated as
proof of payment. Credit fulfilment must happen exactly once from a verified webhook event.

## Production checklist

- Replace mock generation with tested provider adapters.
- Complete and test provider-specific webhook signature verification.
- Test RLS with two unrelated users and every admin role.
- Set strict upload size, MIME and retention rules.
- Configure CSP, rate limiting, transactional email and monitoring.
- Test failed-job refunds and webhook replay protection.
- Run mobile, keyboard, screen-reader and reduced-motion checks.
- Keep development, staging and production secrets fully separate.
