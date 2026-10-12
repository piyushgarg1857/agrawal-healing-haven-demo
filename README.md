# Dr. Agrawal’s Physiotherapy Centre

## Current delivery status
Booking (secure RPCs + manual UPI verification) and staff admin (Supabase Auth + `admin_users` membership) are implemented against the PHYSIO Supabase project `ussqspqymblfruqsedzv`. No Lovable Cloud database is used. Staff dashboard actions still need a signed-in end-to-end check by the clinic.

## Development / deployment
Install with `bun install`; preview with `bun run dev`. Tests: `bunx vitest run`. The Lovable harness validates builds automatically. The project uses TanStack Start, React, TypeScript and Tailwind v4. Optional env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.

Publish only after the staff end-to-end checklist below passes.

## Export to PHYSIO without overwriting main
GitHub integration is not available for PHYSIO in this Lovable project; no source has been pushed there.
1. On desktop, open Lovable's Code Editor and choose **Download codebase** (paid workspace feature).
2. In your local PHYSIO checkout, create `feat/lovable-ui-backend-integration` from main before copying files.
3. Copy the downloaded app source/configuration into that branch; review the diff, preserving required original infrastructure and excluding credentials/dependencies/build output.
4. Install and run checks, push that branch, then open a pull request targeting main. Do not merge until the launch checklist passes.
Alternatively configure Lovable Git sync in the editor's GitHub settings if supported for your repository; confirm the target branch before syncing. The GitHub API connector is not Git sync.

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
