# Dr. Agrawal’s Physiotherapy Centre

## Current delivery status
Canonical repository: `piyushgarg1857/agrawal-healing-haven-demo`, branch `feat/lovable-ui-backend-integration` (Lovable Git sync). Do not commit directly to `main`. Not deployed to production.

All booking, payment-reference and admin paths use only the PHYSIO Supabase project `ussqspqymblfruqsedzv` with its publishable key. No service-role key, no Lovable Cloud database, no demo booking records.

### Verified (automated or in browser, signed out)
- Typecheck, full build and 11 unit tests pass (`bunx vitest run`).
- Tests confirm: client targets `https://ussqspqymblfruqsedzv.supabase.co`; bookings are created only via `create_physio_booking` (no direct table insert/select); a missing token or a `false` result from `submit_physio_payment_reference` is an error, never success; staff-check network errors are shown, not mislabelled "not authorised"; status updates touching no rows report permission denied; error messages never echo patient input.
- Live fees load from `service_prices`; signed-out reads of `bookings` are denied by RLS.
- All pages render without errors and without horizontal overflow at 1280px and 390px; booking form validation messages appear.
- One labelled real booking ("E2E Test - please cancel") reached the payment step and its reference was accepted as pending manual verification.

### Fixed: booking blocked when a staff session exists (2026-10-12)
Root cause: patient booking calls shared the staff sign-in client. If anyone had signed in on /admin in that browser, the request carried the staff token (role `authenticated`), and that role is intentionally not allowed to run `create_physio_booking`, so the database answered 42501. Fix: patient calls (`create_physio_booking`, `submit_physio_payment_reference`, fee reads) now use a separate anonymous client that never stores a session. Database permissions were not changed. Validation messages from the database (e.g. invalid phone) are now shown as-is.

### Appointment status (2026-10-12)
- After booking, patients see "Request received — appointment not confirmed yet", a short booking reference, service, fee, UPI instructions and a private status code with a copy button.
- After submitting a UPI reference: "Payment submitted for verification — appointment still pending clinic confirmation."
- `/booking-status`: patients enter their private status code (the opaque `public_token`, never the booking ID). It shows status, service, fee, request date and whether a reference was sent — no name, email, phone or payment reference.
- Staff labels: Awaiting payment reference (`pending`), Needs payment verification (`pending_verification`), Payment verified — appointment not confirmed (`completed`), Appointment confirmed (`completed` + `appointment_confirmed_at`), Cancelled. "Appointment agreed" is used only after staff agree a time with the patient by phone. No date/time is stored.
- **Manual step required:** run `db/2026-10-12_booking_status_lookup.sql` once in Supabase → SQL Editor. It adds `bookings.appointment_confirmed_at` and the token-only `get_physio_booking_status` function (anon execute only; no new table grants or policies). Until then, the status page says online status checks are not enabled, and "Appointment agreed" shows that confirmation is not enabled. Verified: the function is currently absent (PGRST202) and the app shows that message.

### Not yet verified
- Status lookup and "Appointment agreed" against the live database (need the SQL above applied).
- Staff sign-in, bookings list, Mark verified / Cancel, and fee saving as a real `admin_users` member (no staff credentials are available to the build agent).
- A signed-in non-staff account seeing "Permission denied".
- Whether public sign-ups are disabled in Supabase Auth.

### Payment truthfulness
UPI payments to `8764336371@fam` are **never** confirmed automatically. A submitted reference only sets the booking to `pending_verification`; staff must check it in the clinic's UPI/bank app and mark it verified.

## Development / deployment
Install with `bun install`; preview with `bun run dev`. Tests: `bun run test`. Build: `bun run build`. The project uses TanStack Start, React, TypeScript and Tailwind v4. Optional env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (public values only).

Publish only after the staff end-to-end checklist below passes.

## Backend (PHYSIO Supabase project)

- Project ref `ussqspqymblfruqsedzv` (ap-south-1), URL `https://ussqspqymblfruqsedzv.supabase.co`. The old `nohpalyybvjmbryimrrt` project is no longer used.
- Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (public; defaults are built in). Never add a service-role key to the frontend.
- Booking: `rpc('create_physio_booking')` returns booking id + opaque token (kept in sessionStorage only until the reference is sent) → UPI `8764336371@fam` → `rpc('submit_physio_payment_reference')` → status pending manual verification. Anonymous users cannot read bookings.
- Admin: Supabase Auth email/password. Dashboard loads only if the user has a row in `admin_users`; otherwise "Permission denied". Fees are updated row-by-row on `service_prices`.

### Admin bootstrap (manual, once)
1. In Supabase → Authentication → Users, create the clinic staff user (disable public sign-ups).
2. In the SQL editor: `insert into public.admin_users(user_id) select id from auth.users where email = '<staff email>';`

### End-to-end checklist
1. Book a service → payment step shows the live fee and UPI ID.
2. Submit a UPI reference → "pending manual verification".
3. Staff signs in → booking listed as "Needs verification" → check UPI app → Mark verified (`completed`) or Cancel (`cancelled`).
4. Non-staff account → "Permission denied", no records.
5. Signed out: `GET /rest/v1/bookings` returns permission denied.
6. Edit a fee in admin → booking page shows the new fee.
