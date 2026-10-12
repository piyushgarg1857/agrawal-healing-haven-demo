# Dr. Agrawal’s Physiotherapy Centre

## Current delivery status
The existing premium Lovable styling, logo, typography, responsive rules and reduced-motion treatment are retained. Source-confirmed service keys, original default fees and clinic contacts replace fictional content. Generated photos remain explicitly illustrative. Fake booking success, fabricated scheduling and all demo patient/admin records have been removed.

**Production backend integration is NOT implemented.** Online booking and admin pages display truthful unavailable states; they do not collect patient information, accept payments, or expose records. No new database was provisioned and no existing database was modified.

## Required connection action
In Lovable, open Cloud → **Already have a Supabase project? Connect it here** and link the existing `nohpalyybvjmbryimrrt` project (https://nohpalyybvjmbryimrrt.supabase.co). Do not enable a new Cloud database. This environment's backend tooling cannot attach the existing project from chat. No private or service-role key is required in frontend code.

## Confirmed integration contracts (pending implementation)
- Auth: `signInWithPassword({ email, password })`, `getSession()`, `signOut()`.
- `bookings`: id, created_at, patient_name, patient_email, patient_phone, service, amount, nullable payment_id, status.
- Insert: pending and payment_id null. Reference update on the same row: pending_verification. Manual admin verification: completed. Rejection: cancelled.
- `service_prices`: service, price. Keys: consultation, musculoskeletal, neurological, pediatric, sports, geriatric. Original INR defaults: 500, 800, 1000, 700, 900, 600; live rows must take precedence once linked.
- No date/time/notes columns; do not claim scheduling is persisted.
- UPI destination supplied by source: `8764336371@fam`. Display QR only after a successful real booking insert and clinic confirmation of destination; never auto-verify payment.

## Security prerequisites / manual review
Hosted policies have not been inspected. Before launch, confirm RLS is enabled, anonymous callers cannot SELECT patient records, and only server-authorized admins can read bookings, update statuses or write prices. Authentication alone must not grant admin authority. Public prices may be readable, but patient data must not be public.

A plain anonymous UPDATE by booking ID is unsafe: knowing an ID must not permit editing another booking. The provided schema has no ownership token or user ID. Verify whether the existing backend provides a secure reference-submission endpoint or ownership mechanism; if absent, agree a separately reviewed change before enabling this operation. Do not broaden RLS to public UPDATE. No policy SQL was applied or invented here.

Keep PII out of application logs, analytics and error reporting. Do not log database payloads/errors. Do not use a service-role key to bypass RLS. No hardcoded admin password.

## Development / deployment
Install with `bun install`; preview with `bun run dev`. Tests: `bunx vitest run`. The Lovable harness validates builds automatically. The project uses TanStack Start, React, TypeScript and Tailwind v4. No new environment variables are currently used; the pending integration must use only the existing public frontend configuration and generated clients after connection.

Do not replace the existing production website with this delivery until booking, login, authorization, prices and manual verification are implemented and verified. Publishing this version would publish the informational website and unavailable pages, not revive the backend.

## End-to-end launch checklist
- [ ] Existing project linked; verify project identity and inspect actual schema/grants/RLS.
- [ ] Signed-out users cannot read any booking; non-admin authenticated users cannot read or mutate admin data.
- [ ] Existing admin signs in, lists actual records, refreshes safely and signs out without cached patient data.
- [ ] Live prices display; authorized price edit persists and reads back.
- [ ] Booking insert persists with exact legacy fields/status; no duplicate on retry.
- [ ] Successful insert precedes QR; secure reference submission updates the same booking only.
- [ ] Manual verification/rejection persists as completed/cancelled; no auto-verification claims.
- [ ] Failed network/RLS paths never show success or leak PII.
- [ ] Mobile, keyboard, reduced-motion and route metadata checks pass.

## Export to PHYSIO without overwriting main
GitHub integration is not available for PHYSIO in this Lovable project; no source has been pushed there.
1. On desktop, open Lovable's Code Editor and choose **Download codebase** (paid workspace feature).
2. In your local PHYSIO checkout, create `feat/lovable-ui-backend-integration` from main before copying files.
3. Copy the downloaded app source/configuration into that branch; review the diff, preserving required original infrastructure and excluding credentials/dependencies/build output.
4. Install and run checks, push that branch, then open a pull request targeting main. Do not merge until the launch checklist passes.
Alternatively configure Lovable Git sync in the editor's GitHub settings if supported for your repository; confirm the target branch before syncing. The GitHub API connector is not Git sync.

## Live backend integration (implemented)

- `src/lib/physio-backend.ts` talks to the existing project (`nohpalyybvjmbryimrrt`) with the public anon key from `PHYSIO/supabase-config.js` (override with `VITE_PHYSIO_SUPABASE_URL` / `VITE_PHYSIO_SUPABASE_ANON_KEY`). No service-role key is used.
- `/booking`: insert `pending` (payment_id null) → UPI instructions for `8764336371@fam` → reference saved to `payment_id`, status `pending_verification`. Nothing is auto-verified.
- `/admin`: Supabase Auth `signInWithPassword` / `signOut`; lists bookings, marks `completed` or `cancelled`, upserts `service_prices`.

### Required database security (not applied automatically)
Run the reviewed script `db/2026-10-12_secure_booking_rpcs.sql` on the existing project after a backup. It:
- adds an `admin_users` staff allow-list and `is_staff()`; only listed staff can read/update bookings or edit fees;
- removes all anonymous access to `bookings` (no public SELECT/UPDATE);
- adds `create_booking` (returns only id + random token; amount taken server-side) and `submit_payment_reference` (needs the token, only pending -> pending_verification);
- keeps `service_prices` publicly readable.
Until it is applied, the booking page shows "Online booking is not yet enabled" and nothing is saved. Remove any legacy broad policies (check `pg_policies`) and disable public sign-ups in Auth settings.

### End-to-end checklist
1. Submit a booking → row appears as "Awaiting payment" in admin.
2. Submit a UPI reference → status "Needs verification".
3. Admin checks the UPI app, marks verified → `completed`; or cancels → `cancelled`.
4. Signed-out browser cannot list bookings (REST `select` on bookings returns `[]` or 401).
5. Edit a fee in admin → booking page shows the new fee.
