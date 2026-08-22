-- ============================================================
-- AYA RAOS — B2B DELIVERY & KREDIT PASOKAN FOUNDATION v1
-- Delivery occurrences are individually historized.
-- Kredit Pasokan is an immutable ledger, never a free-edit balance.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.aya_b2b_delivery_occurrences (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.aya_b2b_relationships(id) on delete restrict,
  commercial_summary_id uuid references public.aya_b2b_commercial_summaries(id) on delete restrict,
  cadence text not null,
  scheduled_at timestamptz not null,
  h3_lock_at timestamptz not null,
  address_snapshot jsonb not null default '{}'::jsonb,
  goods_value_snapshot bigint not null,
  shipping_value_snapshot bigint not null default 0,
  status text not null default 'scheduled',
  commercially_consumed boolean not null default false,
  outcome_recorded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aya_b2b_delivery_cadence_check check (cadence in ('W1','W2','M1','M2')),
  constraint aya_b2b_delivery_h3_check check (h3_lock_at <= scheduled_at),
  constraint aya_b2b_delivery_amount_check check (goods_value_snapshot >= 0 and shipping_value_snapshot >= 0),
  constraint aya_b2b_delivery_status_check check (status in (
    'scheduled','h3_locked','preparing','ready','out_for_delivery',
    'delivered','customer_failed','aya_delayed_delivered','aya_failed','cancelled'
  )),
  constraint aya_b2b_delivery_outcome_shape_check check (
    (status in ('delivered','customer_failed','aya_delayed_delivered','aya_failed','cancelled') and outcome_recorded_at is not null)
    or
    (status not in ('delivered','customer_failed','aya_delayed_delivered','aya_failed','cancelled') and outcome_recorded_at is null)
  )
);

create index if not exists aya_b2b_delivery_relationship_idx
  on public.aya_b2b_delivery_occurrences(relationship_id, scheduled_at desc);
create index if not exists aya_b2b_delivery_upcoming_idx
  on public.aya_b2b_delivery_occurrences(status, scheduled_at)
  where status in ('scheduled','h3_locked','preparing','ready','out_for_delivery');

create table if not exists public.aya_b2b_delivery_events (
  id bigint generated always as identity primary key,
  delivery_id uuid not null references public.aya_b2b_delivery_occurrences(id) on delete restrict,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists aya_b2b_delivery_events_idx
  on public.aya_b2b_delivery_events(delivery_id, created_at, id);

create table if not exists public.aya_b2b_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.aya_b2b_relationships(id) on delete restrict,
  commercial_summary_id uuid references public.aya_b2b_commercial_summaries(id) on delete restrict,
  source_type text not null,
  source_reference text not null,
  amount_delta bigint not null,
  currency text not null default 'IDR',
  description text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint aya_b2b_credit_source_type_check check (source_type in (
    'delivery_delay','delivery_failure','approved_reduction','lower_value_adjustment',
    'product_unavailability','credit_application','approved_correction','reversal'
  )),
  constraint aya_b2b_credit_amount_check check (amount_delta <> 0),
  constraint aya_b2b_credit_currency_check check (currency = 'IDR'),
  constraint aya_b2b_credit_reference_check check (char_length(btrim(source_reference)) between 1 and 200),
  constraint aya_b2b_credit_description_check check (char_length(btrim(description)) between 1 and 500)
);

create unique index if not exists aya_b2b_credit_source_uidx
  on public.aya_b2b_credit_ledger(source_type, source_reference);
create index if not exists aya_b2b_credit_relationship_idx
  on public.aya_b2b_credit_ledger(relationship_id, created_at, id);

create or replace function public.aya_b2b_guard_immutable_event_v1()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  raise exception using message = 'immutable_ledger_event', errcode = '55000';
end;
$$;

drop trigger if exists aya_b2b_guard_delivery_events_immutable on public.aya_b2b_delivery_events;
create trigger aya_b2b_guard_delivery_events_immutable
before update or delete on public.aya_b2b_delivery_events
for each row execute function public.aya_b2b_guard_immutable_event_v1();

drop trigger if exists aya_b2b_guard_credit_ledger_immutable on public.aya_b2b_credit_ledger;
create trigger aya_b2b_guard_credit_ledger_immutable
before update or delete on public.aya_b2b_credit_ledger
for each row execute function public.aya_b2b_guard_immutable_event_v1();

create or replace function public.aya_b2b_finalize_delivery_outcome_v1(
  p_delivery_id uuid,
  p_outcome text,
  p_recorded_at timestamptz default now()
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_delivery public.aya_b2b_delivery_occurrences%rowtype;
  v_outcome text := lower(btrim(coalesce(p_outcome,'')));
  v_credit bigint := 0;
  v_source_type text;
begin
  if v_outcome not in ('delivered','customer_failed','aya_delayed_delivered','aya_failed') then
    raise exception using message = 'invalid_delivery_outcome', errcode = '22023';
  end if;

  select * into v_delivery
  from public.aya_b2b_delivery_occurrences
  where id = p_delivery_id
  for update;

  if not found then
    raise exception using message = 'delivery_not_found', errcode = 'P0002';
  end if;

  if v_delivery.status in ('delivered','customer_failed','aya_delayed_delivered','aya_failed','cancelled') then
    return jsonb_build_object(
      'deliveryId', v_delivery.id,
      'status', v_delivery.status,
      'creditAmount', 0,
      'duplicate', true
    );
  end if;

  if v_outcome = 'aya_delayed_delivered' then
    v_credit := (v_delivery.goods_value_snapshot * 50) / 100;
    v_source_type := 'delivery_delay';
  elsif v_outcome = 'aya_failed' then
    v_credit := v_delivery.goods_value_snapshot;
    v_source_type := 'delivery_failure';
  end if;

  update public.aya_b2b_delivery_occurrences
  set status = v_outcome,
      commercially_consumed = case when v_outcome = 'customer_failed' then true else commercially_consumed end,
      outcome_recorded_at = p_recorded_at,
      updated_at = now()
  where id = v_delivery.id;

  insert into public.aya_b2b_delivery_events(delivery_id, event_type, event_data)
  values (
    v_delivery.id,
    'outcome_recorded',
    jsonb_build_object('outcome',v_outcome,'goodsValue',v_delivery.goods_value_snapshot,'creditAmount',v_credit)
  );

  if v_credit > 0 then
    insert into public.aya_b2b_credit_ledger(
      relationship_id, commercial_summary_id, source_type, source_reference,
      amount_delta, description, metadata
    ) values (
      v_delivery.relationship_id,
      v_delivery.commercial_summary_id,
      v_source_type,
      v_delivery.id::text,
      v_credit,
      case when v_outcome = 'aya_delayed_delivered'
        then 'Kredit Pasokan 50% nilai barang akibat keterlambatan AYA.'
        else 'Kredit Pasokan 100% nilai barang akibat kegagalan pengiriman AYA.'
      end,
      jsonb_build_object('deliveryId',v_delivery.id,'shippingExcluded',true)
    )
    on conflict (source_type, source_reference) do nothing;
  end if;

  return jsonb_build_object(
    'deliveryId', v_delivery.id,
    'status', v_outcome,
    'creditAmount', v_credit,
    'duplicate', false
  );
end;
$$;

create or replace function public.aya_b2b_credit_balance_v1(p_relationship_id uuid)
returns bigint
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select coalesce(sum(amount_delta),0)::bigint
  from public.aya_b2b_credit_ledger
  where relationship_id = p_relationship_id;
$$;

alter table public.aya_b2b_delivery_occurrences enable row level security;
alter table public.aya_b2b_delivery_events enable row level security;
alter table public.aya_b2b_credit_ledger enable row level security;

revoke all on table
  public.aya_b2b_delivery_occurrences,
  public.aya_b2b_delivery_events,
  public.aya_b2b_credit_ledger
from public, anon, authenticated;

revoke all on function public.aya_b2b_guard_immutable_event_v1() from public, anon, authenticated;
revoke all on function public.aya_b2b_finalize_delivery_outcome_v1(uuid, text, timestamptz) from public, anon, authenticated;
revoke all on function public.aya_b2b_credit_balance_v1(uuid) from public, anon, authenticated;

grant select, insert, update, delete on table public.aya_b2b_delivery_occurrences to service_role;
grant select, insert on table public.aya_b2b_delivery_events, public.aya_b2b_credit_ledger to service_role;
grant usage, select on sequence public.aya_b2b_delivery_events_id_seq to service_role;

grant execute on function public.aya_b2b_guard_immutable_event_v1() to service_role;
grant execute on function public.aya_b2b_finalize_delivery_outcome_v1(uuid, text, timestamptz) to service_role;
grant execute on function public.aya_b2b_credit_balance_v1(uuid) to service_role;

comment on table public.aya_b2b_delivery_occurrences is
  'Each B2B delivery is individually historized; customer-side failure is not Delivered and may be commercially consumed.';
comment on table public.aya_b2b_credit_ledger is
  'Immutable Kredit Pasokan ledger. Positive entries create credit; negative entries apply or reverse credit.';
