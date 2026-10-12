-- Reviewed migration for the PHYSIO Supabase project (ussqspqymblfruqsedzv).
-- STATUS: APPLIED to the live project by the owner on 2026-10-12 (execute revoked from
-- PUBLIC and authenticated, granted to anon only). Kept for review/reproducibility;
-- every statement is idempotent and safe to re-run.
-- Purpose: let a patient check their own booking status with the opaque booking
-- token (public_token) they received, and let staff record that an appointment
-- has been agreed. No appointment date/time is stored or invented.

-- 1. Staff-only marker that the clinic has agreed a visit with the patient.
alter table public.bookings
  add column if not exists appointment_confirmed_at timestamptz;
-- Staff update this column through the existing admin_users-gated UPDATE policy.
-- No new policy or grant is added for bookings; anon still cannot read the table.

-- 2. Token-only status lookup. Returns no patient name, email, phone or payment reference.
create or replace function public.get_physio_booking_status(p_booking_token text)
returns table (
  status text,
  service text,
  amount numeric,
  created_at timestamptz,
  payment_submitted boolean,
  appointment_confirmed boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select b.status::text, b.service::text, b.amount::numeric, b.created_at,
         b.payment_id is not null, b.appointment_confirmed_at is not null
  from public.bookings b
  where length(coalesce(p_booking_token, '')) >= 16
    and b.public_token::text = p_booking_token
  limit 1;
$$;

revoke all on function public.get_physio_booking_status(text) from public;
revoke all on function public.get_physio_booking_status(text) from authenticated;
grant execute on function public.get_physio_booking_status(text) to anon;
-- Match the existing booking RPCs: authenticated has no execute; the frontend calls
-- this through a session-less anon client.

-- Rollback:
-- drop function if exists public.get_physio_booking_status(text);
-- alter table public.bookings drop column if exists appointment_confirmed_at;
