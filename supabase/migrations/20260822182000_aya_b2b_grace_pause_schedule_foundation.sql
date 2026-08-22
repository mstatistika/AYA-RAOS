-- AYA RAOS — B2B Grace / Pause / Schedule foundation
-- Canonical rules: H-7 due; one tolerated delivery during Grace; Grace expires
-- 7 days after tolerated delivery; unpaid => Supply Paused; full verified
-- outstanding => Auto Resume. 2 Grace events in rolling 6 months => Payment Flag.
-- Delivery defaults: W1 Monday weekly, W2 Monday/2 weeks, M1 first Monday/month,
-- M2 first Monday/every 2 months. H-3 lock. Fixed voluntary pause: 4 weeks total,
-- max 3 weeks/month, weekly rounding. NFC pause: M2 only, max 1 week.

create table if not exists public.aya_b2b_status_events (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.aya_b2b_relationships(id),
  from_status text,
  to_status text not null,
  event_type text not null,
  source_reference text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.aya_b2b_grace_events (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.aya_b2b_relationships(id),
  payment_obligation_id uuid references public.aya_b2b_payment_obligations(id),
  tolerated_delivery_id uuid references public.aya_b2b_delivery_occurrences(id),
  entered_at timestamptz not null default now(),
  expires_at timestamptz,
  resolved_at timestamptz,
  resolution text,
  created_at timestamptz not null default now(),
  check (resolution is null or resolution in ('paid','expired','cancelled'))
);

create table if not exists public.aya_b2b_payment_flags (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.aya_b2b_relationships(id),
  flag_type text not null default 'payment_flag',
  triggered_at timestamptz not null default now(),
  active boolean not null default true,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  resolved_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.aya_b2b_voluntary_pauses (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.aya_b2b_relationships(id),
  pause_kind text not null,
  requested_weeks integer not null,
  approved_weeks integer,
  starts_on date not null,
  ends_on date,
  status text not null default 'requested',
  commitment_extension_days integer not null default 0,
  requested_by uuid,
  approved_by uuid,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (pause_kind in ('fixed','nfc')),
  check (requested_weeks > 0),
  check (status in ('requested','approved','rejected','active','completed','cancelled')),
  check (approved_weeks is null or approved_weeks > 0)
);

create table if not exists public.aya_b2b_schedule_changes (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.aya_b2b_relationships(id),
  delivery_occurrence_id uuid references public.aya_b2b_delivery_occurrences(id),
  change_type text not null,
  requested_at timestamptz not null default now(),
  requested_by uuid,
  effective_on date,
  old_value jsonb not null default '{}'::jsonb,
  new_value jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  admin_review_required boolean not null default false,
  admin_decision_at timestamptz,
  admin_decision_by uuid,
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (change_type in ('date_change','cadence_change','add_product','increase_quantity','change_variant','change_unit','reduce_quantity','remove_product')),
  check (status in ('pending','approved','rejected','applied','cancelled'))
);

create index if not exists idx_aya_b2b_grace_relationship_entered on public.aya_b2b_grace_events(relationship_id, entered_at desc);
create index if not exists idx_aya_b2b_status_relationship_created on public.aya_b2b_status_events(relationship_id, created_at desc);
create index if not exists idx_aya_b2b_payment_flags_active on public.aya_b2b_payment_flags(relationship_id, active);
create index if not exists idx_aya_b2b_pause_relationship on public.aya_b2b_voluntary_pauses(relationship_id, starts_on);
create index if not exists idx_aya_b2b_schedule_changes_relationship on public.aya_b2b_schedule_changes(relationship_id, requested_at desc);

-- Normalize relationship lifecycle/status vocabulary for target state machine.
alter table public.aya_b2b_relationships
  drop constraint if exists aya_b2b_relationships_lifecycle_stage_check;
alter table public.aya_b2b_relationships
  add constraint aya_b2b_relationships_lifecycle_stage_check
  check (lifecycle_stage in ('qualification','draft','confirmed','active','grace','supply_paused','nfc','closed'));

alter table public.aya_b2b_relationships
  drop constraint if exists aya_b2b_relationships_status_check;
alter table public.aya_b2b_relationships
  add constraint aya_b2b_relationships_status_check
  check (status in ('pending','active','grace','supply_paused','nfc','closed'));

-- Helper: Monday-based default delivery date.
create or replace function public.aya_b2b_default_delivery_date_v1(
  p_cadence text,
  p_from_date date
) returns date
language sql
immutable
security invoker
set search_path = public
as $$
  with monday as (
    select p_from_date + ((8 - extract(isodow from p_from_date)::int) % 7) as d
  )
  select case p_cadence
    when 'W1' then (select d from monday)
    when 'W2' then (select d from monday)
    when 'M1' then (
      date_trunc('month', p_from_date)::date
      + ((8 - extract(isodow from date_trunc('month', p_from_date)::date)::int) % 7)
    )
    when 'M2' then (
      date_trunc('month', p_from_date)::date
      + ((8 - extract(isodow from date_trunc('month', p_from_date)::date)::int) % 7)
    )
    else null
  end;
$$;

-- Change requests after H-3 are not allowed to mutate a locked occurrence.
create or replace function public.aya_b2b_change_cutoff_check_v1()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_h3 timestamptz;
begin
  if new.delivery_occurrence_id is null then
    return new;
  end if;
  select h3_lock_at into v_h3
  from public.aya_b2b_delivery_occurrences
  where id = new.delivery_occurrence_id;
  if v_h3 is not null and new.requested_at >= v_h3 then
    raise exception 'Change rejected after H-3 lock' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_aya_b2b_schedule_change_h3 on public.aya_b2b_schedule_changes;
create trigger trg_aya_b2b_schedule_change_h3
before insert or update on public.aya_b2b_schedule_changes
for each row execute function public.aya_b2b_change_cutoff_check_v1();

-- Trusted state transition for payment recovery. Full outstanding must be verified paid.
create or replace function public.aya_b2b_auto_resume_if_fully_paid_v1(p_relationship_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_outstanding bigint;
  v_status text;
begin
  select coalesce(sum(greatest(amount_due - amount_verified_paid, 0)),0)
    into v_outstanding
  from public.aya_b2b_payment_obligations
  where relationship_id = p_relationship_id
    and status <> 'cancelled';

  select status into v_status from public.aya_b2b_relationships where id = p_relationship_id for update;
  if v_status = 'supply_paused' and v_outstanding = 0 then
    update public.aya_b2b_relationships
      set status='active', lifecycle_stage='active', updated_at=now()
      where id=p_relationship_id;
    insert into public.aya_b2b_status_events(relationship_id,from_status,to_status,event_type,reason)
      values(p_relationship_id,'supply_paused','active','auto_resume','Full outstanding verified paid');
    update public.aya_b2b_grace_events
      set resolved_at=coalesce(resolved_at,now()), resolution=coalesce(resolution,'paid')
      where relationship_id=p_relationship_id and resolved_at is null;
    return true;
  end if;
  return false;
end;
$$;

-- Payment Flag is derived from Grace history, not manually entered.
create or replace function public.aya_b2b_refresh_payment_flag_v1(p_relationship_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
  from public.aya_b2b_grace_events
  where relationship_id=p_relationship_id
    and entered_at >= now() - interval '6 months';

  if v_count >= 2 then
    if not exists (select 1 from public.aya_b2b_payment_flags where relationship_id=p_relationship_id and active) then
      insert into public.aya_b2b_payment_flags(relationship_id,reason)
      values(p_relationship_id,'Two Grace entries within rolling 6 months');
    end if;
    return true;
  end if;
  return false;
end;
$$;

alter table public.aya_b2b_status_events enable row level security;
alter table public.aya_b2b_grace_events enable row level security;
alter table public.aya_b2b_payment_flags enable row level security;
alter table public.aya_b2b_voluntary_pauses enable row level security;
alter table public.aya_b2b_schedule_changes enable row level security;

revoke all on public.aya_b2b_status_events from anon, authenticated;
revoke all on public.aya_b2b_grace_events from anon, authenticated;
revoke all on public.aya_b2b_payment_flags from anon, authenticated;
revoke all on public.aya_b2b_voluntary_pauses from anon, authenticated;
revoke all on public.aya_b2b_schedule_changes from anon, authenticated;
revoke all on function public.aya_b2b_auto_resume_if_fully_paid_v1(uuid) from anon, authenticated;
revoke all on function public.aya_b2b_refresh_payment_flag_v1(uuid) from anon, authenticated;
