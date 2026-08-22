-- ============================================================
-- AYA RAOS — B2B COMMERCIAL SNAPSHOT FOUNDATION v1
-- Relationship + Draft/Confirmed Commercial Summary + immutable items.
-- No schedule occurrence math, invoice, payment, or activation is created here.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.aya_b2b_relationships (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aya_b2b_companies(id) on delete restrict,
  lifecycle_stage text not null default 'commitment_1',
  status text not null default 'onboarding',
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aya_b2b_relationship_stage_check check (lifecycle_stage in ('commitment_1','commitment_2','nfc')),
  constraint aya_b2b_relationship_status_check check (status in ('onboarding','active','closing','closed')),
  constraint aya_b2b_relationship_closed_shape_check check ((status = 'closed' and closed_at is not null) or status <> 'closed')
);

create unique index if not exists aya_b2b_one_open_relationship_per_company_uidx
  on public.aya_b2b_relationships(company_id)
  where status <> 'closed';

create index if not exists aya_b2b_relationship_company_idx
  on public.aya_b2b_relationships(company_id, status, opened_at desc);

create table if not exists public.aya_b2b_commercial_summaries (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.aya_b2b_relationships(id) on delete restrict,
  version_no integer not null,
  summary_kind text not null,
  status text not null default 'draft',
  billing_option text not null,
  payment_option text not null,
  commitment_months integer,
  commitment_start date,
  commitment_end date,
  total_committed_value bigint,
  schedule_basis jsonb not null default '{}'::jsonb,
  terms_version text not null,
  terms_snapshot jsonb not null default '{}'::jsonb,
  confirmed_by uuid references auth.users(id) on delete restrict,
  confirmed_at timestamptz,
  supersedes_summary_id uuid references public.aya_b2b_commercial_summaries(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (relationship_id, version_no),
  constraint aya_b2b_summary_version_check check (version_no >= 1),
  constraint aya_b2b_summary_kind_check check (summary_kind in ('fixed_commitment','nfc')),
  constraint aya_b2b_summary_status_check check (status in ('draft','confirmed','superseded')),
  constraint aya_b2b_summary_billing_check check (billing_option in ('per_delivery','per_month','per_2_months')),
  constraint aya_b2b_summary_payment_check check (payment_option in ('upfront_100','upfront_50','pay_per_delivery')),
  constraint aya_b2b_summary_value_check check (total_committed_value is null or total_committed_value >= 0),
  constraint aya_b2b_summary_confirmation_shape_check check (
    (status = 'draft' and confirmed_by is null and confirmed_at is null)
    or
    (status in ('confirmed','superseded') and confirmed_by is not null and confirmed_at is not null)
  ),
  constraint aya_b2b_summary_fixed_shape_check check (
    (summary_kind = 'fixed_commitment' and commitment_months = 6)
    or
    (summary_kind = 'nfc' and commitment_months is null and commitment_end is null)
  )
);

create index if not exists aya_b2b_summary_relationship_idx
  on public.aya_b2b_commercial_summaries(relationship_id, status, version_no desc);

create table if not exists public.aya_b2b_commercial_summary_items (
  id uuid primary key default gen_random_uuid(),
  summary_id uuid not null references public.aya_b2b_commercial_summaries(id) on delete cascade,
  line_number integer not null,
  measurement_id uuid not null references public.aya_b2b_measurements(id) on delete restrict,
  product_id text not null references public.aya_product_master(product_id) on delete restrict,
  product_name_snapshot text not null,
  variant_name_snapshot text not null,
  unit_label_snapshot text not null,
  quantity numeric(14,4) not null,
  cadence text not null,
  cogs_snapshot bigint not null,
  supply_price_snapshot bigint not null,
  margin_snapshot bigint generated always as (supply_price_snapshot - cogs_snapshot) stored,
  created_at timestamptz not null default now(),
  unique (summary_id, line_number),
  constraint aya_b2b_summary_item_line_check check (line_number >= 1),
  constraint aya_b2b_summary_item_quantity_check check (quantity > 0),
  constraint aya_b2b_summary_item_cadence_check check (cadence in ('W1','W2','M1','M2')),
  constraint aya_b2b_summary_item_cogs_check check (cogs_snapshot >= 0),
  constraint aya_b2b_summary_item_supply_price_check check (supply_price_snapshot >= 0),
  constraint aya_b2b_summary_item_margin_check check (supply_price_snapshot - cogs_snapshot > 0)
);

create index if not exists aya_b2b_summary_items_summary_idx
  on public.aya_b2b_commercial_summary_items(summary_id, line_number);

create or replace function public.aya_b2b_guard_confirmed_summary_mutation_v1()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'DELETE' then
    if old.status in ('confirmed','superseded') then
      raise exception using message = 'confirmed_summary_is_immutable', errcode = '55000';
    end if;
    return old;
  end if;

  if old.status in ('confirmed','superseded') then
    raise exception using message = 'confirmed_summary_is_immutable', errcode = '55000';
  end if;
  return new;
end;
$$;

create or replace function public.aya_b2b_guard_summary_item_mutation_v1()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_summary_id uuid := coalesce(new.summary_id, old.summary_id);
  v_status text;
begin
  select status into v_status
  from public.aya_b2b_commercial_summaries
  where id = v_summary_id;

  if v_status in ('confirmed','superseded') then
    raise exception using message = 'confirmed_summary_items_are_immutable', errcode = '55000';
  end if;

  return case when tg_op = 'DELETE' then old else new end;
end;
$$;

drop trigger if exists aya_b2b_guard_confirmed_summary_mutation on public.aya_b2b_commercial_summaries;
create trigger aya_b2b_guard_confirmed_summary_mutation
before update or delete on public.aya_b2b_commercial_summaries
for each row execute function public.aya_b2b_guard_confirmed_summary_mutation_v1();

drop trigger if exists aya_b2b_guard_summary_item_mutation on public.aya_b2b_commercial_summary_items;
create trigger aya_b2b_guard_summary_item_mutation
before insert or update or delete on public.aya_b2b_commercial_summary_items
for each row execute function public.aya_b2b_guard_summary_item_mutation_v1();

create or replace function public.aya_b2b_confirm_commercial_summary_v1(
  p_summary_id uuid,
  p_confirming_user uuid
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_summary public.aya_b2b_commercial_summaries%rowtype;
  v_relationship public.aya_b2b_relationships%rowtype;
  v_item_count integer;
begin
  select * into v_summary
  from public.aya_b2b_commercial_summaries
  where id = p_summary_id
  for update;

  if not found then
    raise exception using message = 'summary_not_found', errcode = 'P0002';
  end if;
  if v_summary.status <> 'draft' then
    raise exception using message = 'summary_not_draft', errcode = '55000';
  end if;

  select * into v_relationship
  from public.aya_b2b_relationships
  where id = v_summary.relationship_id;

  if not found or v_relationship.status = 'closed' then
    raise exception using message = 'relationship_not_confirmable', errcode = '55000';
  end if;

  if not exists (
    select 1
    from public.aya_b2b_company_members m
    where m.company_id = v_relationship.company_id
      and m.user_id = p_confirming_user
      and m.status = 'active'
  ) then
    raise exception using message = 'confirming_user_not_company_member', errcode = '42501';
  end if;

  if not public.aya_b2b_company_has_verified_email_v1(v_relationship.company_id) then
    raise exception using message = 'verified_company_email_required', errcode = '55000';
  end if;

  select count(*) into v_item_count
  from public.aya_b2b_commercial_summary_items
  where summary_id = p_summary_id;

  if v_item_count < 1 then
    raise exception using message = 'summary_items_required', errcode = '55000';
  end if;

  if v_summary.total_committed_value is null then
    raise exception using message = 'total_committed_value_not_ready', errcode = '55000';
  end if;

  update public.aya_b2b_commercial_summaries
  set status = 'confirmed',
      confirmed_by = p_confirming_user,
      confirmed_at = now(),
      updated_at = now()
  where id = p_summary_id;

  return jsonb_build_object(
    'summaryId', p_summary_id,
    'relationshipId', v_summary.relationship_id,
    'status', 'confirmed',
    'confirmedBy', p_confirming_user
  );
end;
$$;

alter table public.aya_b2b_relationships enable row level security;
alter table public.aya_b2b_commercial_summaries enable row level security;
alter table public.aya_b2b_commercial_summary_items enable row level security;

revoke all on table
  public.aya_b2b_relationships,
  public.aya_b2b_commercial_summaries,
  public.aya_b2b_commercial_summary_items
from public, anon, authenticated;

revoke all on function public.aya_b2b_guard_confirmed_summary_mutation_v1() from public, anon, authenticated;
revoke all on function public.aya_b2b_guard_summary_item_mutation_v1() from public, anon, authenticated;
revoke all on function public.aya_b2b_confirm_commercial_summary_v1(uuid, uuid) from public, anon, authenticated;

grant select, insert, update, delete on table
  public.aya_b2b_relationships,
  public.aya_b2b_commercial_summaries,
  public.aya_b2b_commercial_summary_items
to service_role;

grant execute on function public.aya_b2b_guard_confirmed_summary_mutation_v1() to service_role;
grant execute on function public.aya_b2b_guard_summary_item_mutation_v1() to service_role;
grant execute on function public.aya_b2b_confirm_commercial_summary_v1(uuid, uuid) to service_role;

comment on table public.aya_b2b_relationships is
  'Company B2B relationship root across Commitment #1, Commitment #2 and NFC lifecycle.';
comment on table public.aya_b2b_commercial_summaries is
  'Draft/Confirmed Commercial Summary authority. Confirmed rows are immutable snapshots.';
comment on table public.aya_b2b_commercial_summary_items is
  'Immutable per-item commercial snapshot after parent summary confirmation; includes internal COGS and Supply Price snapshot.';
