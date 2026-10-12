-- REVIEWED SQL FOR THE EXISTING PHYSIO PROJECT (nohpalyybvjmbryimrrt).
-- NOT executed automatically. Back up, inspect pg_policies, then run in the SQL editor.
-- Keeps legacy columns/status values; adds one nullable token column.

begin;

-- 1. Staff allow-list.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
grant select on public.admin_users to authenticated;
grant all on public.admin_users to service_role;
alter table public.admin_users enable row level security;
drop policy if exists "admin self read" on public.admin_users;
create policy "admin self read" on public.admin_users for select to authenticated using (user_id = auth.uid());
-- Add staff manually, e.g.:
-- insert into public.admin_users(user_id) select id from auth.users where email = 'Dr.agrawalphysio@gmail.com';

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

-- 2. Opaque per-booking token so patients can submit a reference without reading rows.
alter table public.bookings add column if not exists payment_token uuid;

-- 3. Bookings: no anon access; staff only. Drop legacy broad policies by name first (see pg_policies).
alter table public.bookings enable row level security;
revoke all on public.bookings from anon;
grant select, update on public.bookings to authenticated;
drop policy if exists "staff read bookings" on public.bookings;
drop policy if exists "staff update bookings" on public.bookings;
create policy "staff read bookings" on public.bookings for select to authenticated using (public.is_staff());
create policy "staff update bookings" on public.bookings for update to authenticated
  using (public.is_staff()) with check (public.is_staff() and status in ('pending','pending_verification','completed','cancelled'));

-- 4. Prices: public read, staff write.
alter table public.service_prices enable row level security;
grant select on public.service_prices to anon, authenticated;
grant insert, update on public.service_prices to authenticated;
drop policy if exists "prices public read" on public.service_prices;
drop policy if exists "prices staff insert" on public.service_prices;
drop policy if exists "prices staff update" on public.service_prices;
create policy "prices public read" on public.service_prices for select to anon, authenticated using (true);
create policy "prices staff insert" on public.service_prices for insert to authenticated with check (public.is_staff());
create policy "prices staff update" on public.service_prices for update to authenticated using (public.is_staff()) with check (public.is_staff());

-- 5. Create booking: amount from service_prices server-side; returns id + token only.
create or replace function public.create_booking(p_name text, p_email text, p_phone text, p_service text)
returns table (booking_id text, token uuid)
language plpgsql security definer set search_path = public as $$
declare v_amount numeric; v_token uuid := gen_random_uuid(); v_id text;
begin
  if length(trim(p_name)) < 2 or p_email !~ '^\S+@\S+\.\S+$' or length(p_phone) < 8 then
    raise exception 'invalid input';
  end if;
  select price into v_amount from service_prices where service = p_service;
  if v_amount is null then
    v_amount := case p_service when 'consultation' then 500 when 'musculoskeletal' then 800
      when 'neurological' then 1000 when 'pediatric' then 700 when 'sports' then 900 when 'geriatric' then 600 end;
  end if;
  if v_amount is null then raise exception 'unknown service'; end if;
  insert into bookings(patient_name, patient_email, patient_phone, service, amount, payment_id, status, payment_token)
  values (trim(p_name), trim(p_email), trim(p_phone), p_service, v_amount, null, 'pending', v_token)
  returning id::text into v_id;
  return query select v_id, v_token;
end $$;

-- 6. Submit UPI reference: matching token only, only from 'pending'.
create or replace function public.submit_payment_reference(p_booking_id text, p_token uuid, p_reference text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if p_reference !~ '^[A-Za-z0-9]{6,40}$' then raise exception 'invalid reference'; end if;
  update bookings set payment_id = p_reference, status = 'pending_verification'
   where id::text = p_booking_id and payment_token = p_token and status = 'pending';
  get diagnostics n = row_count;
  return n = 1;
end $$;

revoke all on function public.create_booking(text,text,text,text) from public;
revoke all on function public.submit_payment_reference(text,uuid,text) from public;
grant execute on function public.create_booking(text,text,text,text) to anon, authenticated;
grant execute on function public.submit_payment_reference(text,uuid,text) to anon, authenticated;

commit;
