-- ============================================================
-- AYA RAOS — B2B BILLING & PAYMENT FOUNDATION v1
-- Separates Invoice, Payment Obligation, Provider Attempt and Settlement.
-- Provider adapters remain inactive; no payment can be marked Paid by browser state.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.aya_b2b_invoice_counters (
  period_key text primary key,
  last_value integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint aya_b2b_invoice_counter_period_check check (period_key ~ '^[0-9]{4}$'),
  constraint aya_b2b_invoice_counter_value_check check (last_value >= 0 and last_value <= 99999)
);

create or replace function public.aya_b2b_next_invoice_number_v1(
  p_cadence text,
  p_issued_at timestamptz default now()
)
returns text
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_cadence text := upper(btrim(coalesce(p_cadence,'')));
  v_period text;
  v_next integer;
begin
  if v_cadence not in ('W1','W2','M1','M2') then
    raise exception using message = 'invalid_invoice_cadence', errcode = '22023';
  end if;

  v_period := to_char(p_issued_at at time zone 'Asia/Jakarta', 'MMYY');

  insert into public.aya_b2b_invoice_counters(period_key, last_value, updated_at)
  values (v_period, 1, now())
  on conflict (period_key) do update
    set last_value = public.aya_b2b_invoice_counters.last_value + 1,
        updated_at = now()
  returning last_value into v_next;

  if v_next > 99999 then
    raise exception using message = 'invoice_sequence_exhausted', errcode = '22003';
  end if;

  return 'A2B/INC/' || v_period || v_cadence || '/' || lpad(v_next::text, 5, '0');
end;
$$;

create table if not exists public.aya_b2b_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  relationship_id uuid not null references public.aya_b2b_relationships(id) on delete restrict,
  commercial_summary_id uuid references public.aya_b2b_commercial_summaries(id) on delete restrict,
  cadence text not null,
  billing_scope text not null,
  currency text not null default 'IDR',
  subtotal_amount bigint not null,
  shipping_amount bigint not null default 0,
  service_fee_amount bigint not null default 0,
  total_amount bigint generated always as (subtotal_amount + shipping_amount + service_fee_amount) stored,
  status text not null default 'draft',
  issued_at timestamptz,
  due_at timestamptz,
  voided_at timestamptz,
  void_reason text,
  replaces_invoice_id uuid references public.aya_b2b_invoices(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aya_b2b_invoice_number_check check (invoice_number ~ '^A2B/INC/[0-9]{4}(W1|W2|M1|M2)/[0-9]{5}$'),
  constraint aya_b2b_invoice_cadence_check check (cadence in ('W1','W2','M1','M2')),
  constraint aya_b2b_invoice_scope_check check (billing_scope in ('per_delivery','per_month','per_2_months','topup','balance_settlement')),
  constraint aya_b2b_invoice_currency_check check (currency = 'IDR'),
  constraint aya_b2b_invoice_amount_check check (subtotal_amount >= 0 and shipping_amount >= 0 and service_fee_amount >= 0),
  constraint aya_b2b_invoice_status_check check (status in ('draft','issued','void')),
  constraint aya_b2b_invoice_issue_shape_check check (
    (status = 'draft' and issued_at is null and voided_at is null)
    or
    (status = 'issued' and issued_at is not null and voided_at is null)
    or
    (status = 'void' and issued_at is not null and voided_at is not null and nullif(btrim(void_reason),'') is not null)
  )
);

create index if not exists aya_b2b_invoices_relationship_idx
  on public.aya_b2b_invoices(relationship_id, status, created_at desc);
create index if not exists aya_b2b_invoices_due_idx
  on public.aya_b2b_invoices(status, due_at)
  where status = 'issued';

create table if not exists public.aya_b2b_payment_obligations (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.aya_b2b_relationships(id) on delete restrict,
  invoice_id uuid references public.aya_b2b_invoices(id) on delete restrict,
  obligation_type text not null,
  currency text not null default 'IDR',
  amount_due bigint not null,
  amount_verified_paid bigint not null default 0,
  due_at timestamptz not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aya_b2b_obligation_type_check check (obligation_type in ('activation','invoice','topup','remaining_balance','refund_recovery')),
  constraint aya_b2b_obligation_currency_check check (currency = 'IDR'),
  constraint aya_b2b_obligation_amount_check check (amount_due > 0 and amount_verified_paid >= 0 and amount_verified_paid <= amount_due),
  constraint aya_b2b_obligation_status_check check (status in ('pending','partially_paid','paid','cancelled')),
  constraint aya_b2b_obligation_status_amount_check check (
    (status = 'pending' and amount_verified_paid = 0)
    or
    (status = 'partially_paid' and amount_verified_paid > 0 and amount_verified_paid < amount_due)
    or
    (status = 'paid' and amount_verified_paid = amount_due)
    or
    status = 'cancelled'
  )
);

create index if not exists aya_b2b_obligations_relationship_idx
  on public.aya_b2b_payment_obligations(relationship_id, status, due_at);
create index if not exists aya_b2b_obligations_invoice_idx
  on public.aya_b2b_payment_obligations(invoice_id)
  where invoice_id is not null;

create table if not exists public.aya_b2b_payment_attempts (
  id uuid primary key default gen_random_uuid(),
  obligation_id uuid not null references public.aya_b2b_payment_obligations(id) on delete restrict,
  provider text not null,
  provider_attempt_reference text,
  payment_method text,
  amount_requested bigint not null,
  status text not null default 'created',
  provider_verified_at timestamptz,
  expires_at timestamptz,
  failure_code text,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aya_b2b_payment_attempt_provider_check check (provider in ('doku','midtrans')),
  constraint aya_b2b_payment_attempt_amount_check check (amount_requested > 0),
  constraint aya_b2b_payment_attempt_status_check check (status in ('created','pending','verified_paid','failed','expired','refunded')),
  constraint aya_b2b_payment_attempt_verified_shape_check check (
    (status = 'verified_paid' and provider_verified_at is not null)
    or
    status <> 'verified_paid'
  )
);

create unique index if not exists aya_b2b_payment_provider_reference_uidx
  on public.aya_b2b_payment_attempts(provider, provider_attempt_reference)
  where provider_attempt_reference is not null;
create index if not exists aya_b2b_payment_attempt_obligation_idx
  on public.aya_b2b_payment_attempts(obligation_id, created_at desc);

create table if not exists public.aya_b2b_payment_settlements (
  id uuid primary key default gen_random_uuid(),
  payment_attempt_id uuid not null references public.aya_b2b_payment_attempts(id) on delete restrict,
  provider_settlement_reference text,
  currency text not null default 'IDR',
  gross_amount bigint not null,
  provider_fee_amount bigint not null default 0,
  customer_borne_fee_amount bigint not null default 0,
  net_settlement_amount bigint not null,
  status text not null default 'pending',
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aya_b2b_settlement_currency_check check (currency = 'IDR'),
  constraint aya_b2b_settlement_amount_check check (
    gross_amount >= 0 and provider_fee_amount >= 0 and customer_borne_fee_amount >= 0 and net_settlement_amount >= 0
  ),
  constraint aya_b2b_settlement_status_check check (status in ('pending','settled','failed')),
  constraint aya_b2b_settlement_shape_check check ((status = 'settled' and settled_at is not null) or status <> 'settled')
);

create unique index if not exists aya_b2b_settlement_provider_reference_uidx
  on public.aya_b2b_payment_settlements(provider_settlement_reference)
  where provider_settlement_reference is not null;
create index if not exists aya_b2b_settlement_attempt_idx
  on public.aya_b2b_payment_settlements(payment_attempt_id, status);

create or replace function public.aya_b2b_apply_verified_payment_v1(
  p_payment_attempt_id uuid,
  p_provider_verified_at timestamptz,
  p_provider_reference text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_attempt public.aya_b2b_payment_attempts%rowtype;
  v_obligation public.aya_b2b_payment_obligations%rowtype;
  v_new_paid bigint;
  v_new_status text;
begin
  if p_provider_verified_at is null then
    raise exception using message = 'provider_verification_required', errcode = '22023';
  end if;

  select * into v_attempt
  from public.aya_b2b_payment_attempts
  where id = p_payment_attempt_id
  for update;

  if not found then
    raise exception using message = 'payment_attempt_not_found', errcode = 'P0002';
  end if;

  if v_attempt.status = 'verified_paid' then
    select * into v_obligation from public.aya_b2b_payment_obligations where id = v_attempt.obligation_id;
    return jsonb_build_object(
      'attemptId', v_attempt.id,
      'obligationId', v_attempt.obligation_id,
      'attemptStatus', v_attempt.status,
      'obligationStatus', v_obligation.status,
      'duplicate', true
    );
  end if;

  if v_attempt.status in ('failed','expired','refunded') then
    raise exception using message = 'payment_attempt_not_payable', errcode = '55000';
  end if;

  select * into v_obligation
  from public.aya_b2b_payment_obligations
  where id = v_attempt.obligation_id
  for update;

  if not found or v_obligation.status = 'cancelled' then
    raise exception using message = 'payment_obligation_not_payable', errcode = '55000';
  end if;

  v_new_paid := least(v_obligation.amount_due, v_obligation.amount_verified_paid + v_attempt.amount_requested);
  v_new_status := case
    when v_new_paid = v_obligation.amount_due then 'paid'
    when v_new_paid > 0 then 'partially_paid'
    else 'pending'
  end;

  update public.aya_b2b_payment_attempts
  set status = 'verified_paid',
      provider_verified_at = p_provider_verified_at,
      provider_attempt_reference = coalesce(nullif(btrim(p_provider_reference),''), provider_attempt_reference),
      updated_at = now()
  where id = v_attempt.id;

  update public.aya_b2b_payment_obligations
  set amount_verified_paid = v_new_paid,
      status = v_new_status,
      updated_at = now()
  where id = v_obligation.id;

  return jsonb_build_object(
    'attemptId', v_attempt.id,
    'obligationId', v_obligation.id,
    'attemptStatus', 'verified_paid',
    'obligationStatus', v_new_status,
    'verifiedPaidAmount', v_new_paid,
    'amountDue', v_obligation.amount_due,
    'duplicate', false
  );
end;
$$;

alter table public.aya_b2b_invoice_counters enable row level security;
alter table public.aya_b2b_invoices enable row level security;
alter table public.aya_b2b_payment_obligations enable row level security;
alter table public.aya_b2b_payment_attempts enable row level security;
alter table public.aya_b2b_payment_settlements enable row level security;

revoke all on table
  public.aya_b2b_invoice_counters,
  public.aya_b2b_invoices,
  public.aya_b2b_payment_obligations,
  public.aya_b2b_payment_attempts,
  public.aya_b2b_payment_settlements
from public, anon, authenticated;

revoke all on function public.aya_b2b_next_invoice_number_v1(text, timestamptz) from public, anon, authenticated;
revoke all on function public.aya_b2b_apply_verified_payment_v1(uuid, timestamptz, text) from public, anon, authenticated;

grant select, insert, update, delete on table
  public.aya_b2b_invoice_counters,
  public.aya_b2b_invoices,
  public.aya_b2b_payment_obligations,
  public.aya_b2b_payment_attempts,
  public.aya_b2b_payment_settlements
to service_role;

grant execute on function public.aya_b2b_next_invoice_number_v1(text, timestamptz) to service_role;
grant execute on function public.aya_b2b_apply_verified_payment_v1(uuid, timestamptz, text) to service_role;

comment on table public.aya_b2b_invoices is
  'Immutable-number B2B invoice authority. Invoice, payment and settlement remain distinct entities.';
comment on table public.aya_b2b_payment_obligations is
  'AYA-owned payable obligation. Paid amount changes only through trusted backend/provider verification.';
comment on table public.aya_b2b_payment_attempts is
  'Provider attempts; one obligation may have multiple attempts. DOKU primary and Midtrans fallback adapters remain external.';
comment on table public.aya_b2b_payment_settlements is
  'Provider settlement ledger. Customer Paid state is separate from provider settlement state.';
