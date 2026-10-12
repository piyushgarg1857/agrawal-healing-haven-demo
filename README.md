# Dr. Agrawal’s Physiotherapy Centre

<p align="center">
  <strong>A modern, responsive physiotherapy clinic website with online booking requests, UPI payment-reference submission, private booking-status lookup, and a staff-only admin dashboard.</strong>
</p>

<p align="center">
  <a href="https://agrawal-healing-haven-demo-piyushs-projects-399f6123.vercel.app">Live website</a> ·
  <a href="https://github.com/piyushgarg1857/agrawal-healing-haven-demo">Source code</a> ·
  <a href="https://supabase.com/dashboard/project/ussqspqymblfruqsedzv">Supabase project</a>
</p>

---

## Project at a glance

| | Details |
|---|---|
| **Status** | Deployed to Vercel production |
| **Repository** | [`piyushgarg1857/agrawal-healing-haven-demo`](https://github.com/piyushgarg1857/agrawal-healing-haven-demo) |
| **Production branch** | `main` |
| **Hosting** | Vercel, connected to GitHub |
| **Frontend** | React 19, TypeScript, TanStack Start/Router, Vite |
| **Styling** | Tailwind CSS v4 and reusable UI components |
| **Backend** | Supabase (PostgreSQL, Auth, Row Level Security, RPC functions) |
| **Test runner** | Vitest, Testing Library, jsdom |
| **Payments** | UPI reference submission with manual clinic verification; no automatic payment gateway confirmation |

## Live website

**Production:** [agrawal-healing-haven-demo-piyushs-projects-399f6123.vercel.app](https://agrawal-healing-haven-demo-piyushs-projects-399f6123.vercel.app)

The production deployment was confirmed `READY` for the `main` branch after merge commit [`aaf5ec7`](https://github.com/piyushgarg1857/agrawal-healing-haven-demo/commit/aaf5ec7cde4cfb09ccef4fc2ad4eb86d83b89d7a). Patients can use the live site to review clinic information and submit booking requests. The clinic must still verify payments and agree appointment times with patients.

## Features

### Patient experience

- Responsive clinic website designed for desktop and mobile.
- Clinic introduction, treatment/service information, approach, contact details, and booking entry points.
- Service prices are loaded from the clinic database rather than treated as the source of truth in the browser.
- Booking form with input validation and useful error states.
- Booking creation through a controlled Supabase RPC; the public client cannot directly insert or browse patient booking records.
- UPI payment instructions and a form to submit a payment reference.
- Clear messaging that submitting a request or payment reference does **not** by itself confirm an appointment.
- A short booking reference and private status code shown after a successful request.
- `/booking-status` page to look up a booking using its opaque private status code.
- Status lookup returns only the minimum booking information needed by the patient: status, service, amount, request date, payment-reference-submitted indicator, and appointment-confirmed indicator. It does not return patient name, email, phone, or the payment reference.

### Clinic staff experience

- Supabase Auth email/password sign-in for staff.
- Admin dashboard gated by membership in `public.admin_users`.
- Booking review and staff-managed status updates.
- Manual payment verification workflow.
- Service-fee editing backed by `public.service_prices`.
- Permission and network errors are surfaced rather than silently reported as success.

## Booking and confirmation lifecycle

The product deliberately distinguishes a booking request, payment verification, and an agreed appointment time.

1. **Request received (`pending`)** — the request has been recorded. The appointment is not yet confirmed.
2. **Payment reference submitted (`pending_verification`)** — the reference is waiting for a staff member to check it against the clinic’s UPI/bank records.
3. **Payment verified (`completed`)** — staff has checked the payment. Payment verification alone is not a promise that a time slot has been agreed.
4. **Appointment agreed** — after staff has spoken with the patient and agreed a date/time, authorized staff can set `appointment_confirmed_at`. The status view distinguishes this from payment-only completion.
5. **Cancelled (`cancelled`)** — the booking request has been cancelled by authorized staff.

**Scheduling limitation:** appointment date/time is currently agreed with the clinic outside the website. The current booking schema does not store a scheduled slot; the site must not imply that a specific date or time has been booked when it has not.

## Payment policy

- UPI ID: `8764336371@fam`
- Patients submit a payment reference after making their payment.
- A submitted reference changes the request to **pending verification**; it is not proof of payment.
- Clinic staff must independently verify the transaction in the clinic’s UPI/bank app before marking payment verified.
- No payment gateway webhook or automatic bank/UPI confirmation is implemented.
- Never put real patient or payment information into test fixtures, screenshots, issue reports, or demo data.

## Architecture

```text
Patient browser
  ├── Clinic pages and service fees
  ├── Booking form + client-side validation
  ├── UPI instructions + payment reference form
  └── Private booking-status page
          │
          ▼
Supabase public/anonymous client
  ├── create_physio_booking(...) RPC
  ├── submit_physio_payment_reference(...) RPC
  └── get_physio_booking_status(token) RPC
          │
          ▼
Supabase PostgreSQL
  ├── service_prices
  ├── bookings
  ├── Row Level Security (RLS)
  └── constrained SECURITY DEFINER RPCs

Clinic staff browser
  └── Supabase Auth session
          │
          ▼
  admin_users membership + RLS-protected operations
  ├── Review bookings
  ├── Verify payment / cancel request
  ├── Agree appointment with patient
  └── Update service prices
```

Patient-facing operations use a separate anonymous Supabase client so a staff session in the same browser does not accidentally turn public booking calls into authenticated-role requests. The frontend uses only the Supabase project URL and publishable key; it must never contain a service-role key.

## Supabase backend

- **Project ref:** `ussqspqymblfruqsedzv`
- **Region:** Mumbai (`ap-south-1`)
- **Project URL:** `https://ussqspqymblfruqsedzv.supabase.co`
- **Dashboard:** [Open Supabase](https://supabase.com/dashboard/project/ussqspqymblfruqsedzv)

### Core tables

| Table | Purpose |
|---|---|
| `service_prices` | Active service fees shown on the site and used when creating bookings |
| `bookings` | Booking request, service/amount, payment reference, status, opaque public token, and appointment-confirmation timestamp |
| `admin_users` | Allowlist connecting Supabase Auth users to clinic staff privileges |

### RPC functions

| Function | Purpose | Intended caller |
|---|---|---|
| `create_physio_booking(...)` | Validates the request, uses the current service fee, and creates a booking with an opaque status token | Anonymous patient client |
| `submit_physio_payment_reference(...)` | Accepts a payment reference only for the booking/token pair and moves it to manual verification | Anonymous patient client with private token |
| `get_physio_booking_status(token)` | Looks up minimal status information by opaque token without returning patient PII | Anonymous patient client with private token |

### Database migration

The booking status lookup and appointment-confirmation timestamp migration is tracked at [`db/2026-10-12_booking_status_lookup.sql`](db/2026-10-12_booking_status_lookup.sql). It has been applied to the connected PHYSIO Supabase project. The migration is retained in the repository for traceability and environment setup; review the SQL before applying it to another environment.

### Security model

- RLS is enabled on patient booking data and admin-managed tables.
- Anonymous users cannot directly read the `bookings` table.
- Public booking and payment actions go through constrained RPC functions instead of direct table writes.
- Public status lookup requires a high-entropy opaque token and returns no patient name, email, phone, or payment reference.
- Execution of the status lookup RPC is granted to `anon`; execution is revoked from `PUBLIC` and `authenticated` roles.
- Staff actions require both a valid Supabase Auth session and membership in `admin_users`, enforced through database policies.
- Public-facing Supabase values are not secrets, but a service-role key is highly privileged and must never be exposed in browser code or committed to Git.
- The browser status lookup has basic client-side throttling/validation. This is not a substitute for server-side abuse protection; review Supabase API limits and add edge/server-side rate limiting if traffic or abuse warrants it.

## Local development

### Prerequisites

- [Bun](https://bun.sh/) (recommended package manager; the repository uses `bun.lock` if present)
- Git
- A Supabase project configured with the expected schema and RPC functions

### Setup

```bash
git clone https://github.com/piyushgarg1857/agrawal-healing-haven-demo.git
cd agrawal-healing-haven-demo
bun install
```

Create a local `.env` file if you need to override the public Supabase defaults:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Only use the **publishable/anon key** in a Vite frontend. Do not use `SUPABASE_SERVICE_ROLE_KEY` or any secret key in a `VITE_*` variable. Vite variables are bundled into client-side assets and are visible to visitors.

Start the local server:

```bash
bun run dev
```

## Quality checks

Run these before opening or merging a pull request:

```bash
bun run test
bun run build
bun run lint
```

Available scripts from `package.json`:

| Command | Purpose |
|---|---|
| `bun run dev` | Start the Vite/TanStack development server |
| `bun run build` | Create a production build |
| `bun run build:dev` | Build using development mode |
| `bun run preview` | Preview a built app locally |
| `bun run test` | Run the Vitest suite once |
| `bun run test:watch` | Run Vitest in watch mode |
| `bun run lint` | Run ESLint |
| `bun run format` | Format files with Prettier (review changes before committing) |

The tests include backend-client targeting and booking-flow regressions, such as ensuring failed RPCs are not reported as successful submissions and errors do not echo patient-entered values. A green unit-test/build result does not replace a live test with an authorized staff account.

## Staff account bootstrap

Perform this once for a trusted clinic staff account:

1. In Supabase **Authentication → Users**, create the staff account with email/password.
2. Disable public sign-ups unless the clinic intentionally needs them.
3. Add the authenticated user's UUID to the allowlist in the SQL editor:

   ```sql
   insert into public.admin_users (user_id)
   select id
   from auth.users
   where email = '<staff-email>'
   on conflict (user_id) do nothing;
   ```

4. Sign in through the site's admin page and verify that the staff dashboard loads.
5. Test booking review, payment verification, cancellation, appointment-agreed action, and fee updates with a non-production test booking.
6. Verify that an authenticated account absent from `admin_users` is denied access.

Do not place staff passwords, access tokens, service-role keys, or patient data in this README or Git history.

## Deployment

Vercel is connected to this GitHub repository. The `main` branch is the production branch; changes merged to `main` trigger a production deployment. Preview deployments are used to validate feature branches before merge.

Recommended release checklist:

- [ ] Confirm the intended commit is on `main`.
- [ ] Confirm Vercel reports the deployment as `READY`.
- [ ] Confirm the correct Supabase URL and publishable key are configured for the target environment.
- [ ] Open the production URL on desktop and mobile.
- [ ] Submit a clearly labelled test booking only when it is safe to create a database record.
- [ ] Verify payment-reference submission remains pending until staff review.
- [ ] Test private status lookup and staff confirmation with authorized credentials.
- [ ] Confirm non-staff users cannot read bookings or change fees/statuses.
- [ ] Check deployment logs and Supabase security advisories before announcing a release.

## Clinic information

**Dr. Agrawal’s Physiotherapy Centre**  
Near HDFC Bank, Delad Patiya, Sayan Oplad, Surat – 394130, Gujarat, India  
**Phone:** +91-7046507918  
**Email:** Dr.agrawalphysio@gmail.com

## Current limitations and next steps

- Appointment date/time is arranged with the clinic; the database does not currently store a booked slot.
- UPI payment verification is manual. No automatic payment gateway/webhook integration exists.
- Status-code lookups rely on the privacy of the opaque token. Patients should keep it private and contact the clinic if they lose it.
- Staff end-to-end tests require a real authorized `admin_users` account and must be completed without using real patient data as test content.
- Review rate limiting, monitoring, backups, and the Supabase security advisor periodically as usage grows.

## Contributing

1. Create a focused feature branch from `main`.
2. Keep database changes in reviewed, versioned SQL migrations.
3. Preserve RLS and the rule that public clients never read booking records directly.
4. Add or update tests for booking, payment, and authorization behavior.
5. Run tests, build, and lint locally.
6. Open a pull request and verify the preview deployment before merging.

## License

No license file is currently declared. All rights remain with the repository owner unless a license is added to this repository.
