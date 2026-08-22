-- AYA RAOS — B2B provider adapter / shipping / notification foundation
-- Provider credentials and external calls stay OFF until configured.

create table if not exists public.aya_b2b_payment_provider_attempts (
  id uuid primary key default gen_random_uuid(),
  payment_obligation_id uuid references public.aya_b2b_payment_obligations(id),
  invoice_id uuid references public.aya_b2b_invoices(id),
  provider text not null,
  provider_reference text,
  attempt_status text not null default 'created',
  requested_amount bigint not null,
  currency text not null default 'IDR',
  request_payload jsonb not null default '{}'::jsonb,
  response_payload jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (provider in ('doku','midtrans')),
  check (attempt_status in ('created','pending','paid','failed','expired','cancelled','reversed'))
);

create table if not exists public.aya_b2b_payment_webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text,
  received_at timestamptz not null default now(),
  signature_verified boolean not null default false,
  processing_status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  error_message text,
  unique(provider, provider_event_id),
  check (provider in ('doku','midtrans')),
  check (processing_status in ('received','processed','ignored','failed'))
);

create table if not exists public.aya_b2b_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid references public.aya_b2b_relationships(id),
  channel text not null default 'email',
  template_key text not null,
  recipient text not null,
  subject text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending',
  scheduled_at timestamptz not null default now(),
  sent_at timestamptz,
  provider_reference text,
  last_error text,
  attempts integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (channel in ('email','whatsapp')),
  check (status in ('pending','processing','sent','failed','cancelled'))
);

create table if not exists public.aya_b2b_shipping_config (
  id uuid primary key default gen_random_uuid(),
  vehicle_type text not null,
  cost_per_km numeric(12,3) not null,
  currency text not null default 'IDR',
  active boolean not null default true,
  effective_from date not null default current_date,
  created_at timestamptz not null default now(),
  check (vehicle_type in ('motor','mobil')),
  check (cost_per_km > 0)
);

create table if not exists public.aya_b2b_shipping_quotes (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid references public.aya_b2b_relationships(id),
  vehicle_type text not null,
  road_distance_km numeric(12,3) not null,
  raw_cost bigint not null,
  customer_charge bigint not null,
  is_flat_commitment_charge boolean not null default false,
  address_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (vehicle_type in ('motor','mobil')),
  check (road_distance_km >= 0),
  check (raw_cost >= 0),
  check (customer_charge >= 0)
);

insert into public.aya_b2b_shipping_config(vehicle_type,cost_per_km)
select 'motor',5187 where not exists(select 1 from public.aya_b2b_shipping_config where vehicle_type='motor' and active);
insert into public.aya_b2b_shipping_config(vehicle_type,cost_per_km)
select 'mobil',10021 where not exists(select 1 from public.aya_b2b_shipping_config where vehicle_type='mobil' and active);

create or replace function public.aya_b2b_calculate_shipping_v1(
  p_vehicle_type text,
  p_road_distance_km numeric
) returns bigint
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_rate numeric;
  v_raw numeric;
begin
  select cost_per_km into v_rate from public.aya_b2b_shipping_config
  where vehicle_type=p_vehicle_type and active=true
  order by effective_from desc limit 1;
  if v_rate is null then raise exception 'Shipping vehicle configuration unavailable'; end if;
  v_raw := greatest(p_road_distance_km,0) * v_rate;
  return ceil(v_raw / 5000.0)::bigint * 5000;
end;
$$;

-- AYA owns payment state. Provider callbacks only enter the webhook inbox;
-- reconciliation/verification is a separate trusted service step.
revoke all on public.aya_b2b_payment_provider_attempts from anon,authenticated;
revoke all on public.aya_b2b_payment_webhook_events from anon,authenticated;
revoke all on public.aya_b2b_notification_outbox from anon,authenticated;
revoke all on public.aya_b2b_shipping_config from anon,authenticated;
revoke all on public.aya_b2b_shipping_quotes from anon,authenticated;
revoke all on function public.aya_b2b_calculate_shipping_v1(text,numeric) from anon,authenticated;

alter table public.aya_b2b_payment_provider_attempts enable row level security;
alter table public.aya_b2b_payment_webhook_events enable row level security;
alter table public.aya_b2b_notification_outbox enable row level security;
alter table public.aya_b2b_shipping_config enable row level security;
alter table public.aya_b2b_shipping_quotes enable row level security;
