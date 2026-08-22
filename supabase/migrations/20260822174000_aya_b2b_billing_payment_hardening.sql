-- ============================================================
-- AYA RAOS — B2B BILLING & PAYMENT HARDENING v1
-- Issued invoice content/number is immutable; void is explicit.
-- verified_paid transition is system-only through trusted verification RPC.
-- ============================================================

create or replace function public.aya_b2b_guard_invoice_mutation_v1()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if tg_op = 'DELETE' then
    if old.status in ('issued','void') then
      raise exception using message = 'issued_invoice_is_immutable', errcode = '55000';
    end if;
    return old;
  end if;

  if old.status = 'void' then
    raise exception using message = 'void_invoice_is_immutable', errcode = '55000';
  end if;

  if old.status = 'issued' then
    if new.status <> 'void' then
      raise exception using message = 'issued_invoice_is_immutable', errcode = '55000';
    end if;

    if new.invoice_number is distinct from old.invoice_number
      or new.relationship_id is distinct from old.relationship_id
      or new.commercial_summary_id is distinct from old.commercial_summary_id
      or new.cadence is distinct from old.cadence
      or new.billing_scope is distinct from old.billing_scope
      or new.currency is distinct from old.currency
      or new.subtotal_amount is distinct from old.subtotal_amount
      or new.shipping_amount is distinct from old.shipping_amount
      or new.service_fee_amount is distinct from old.service_fee_amount
      or new.issued_at is distinct from old.issued_at
      or new.due_at is distinct from old.due_at
      or new.replaces_invoice_id is distinct from old.replaces_invoice_id then
      raise exception using message = 'issued_invoice_content_is_immutable', errcode = '55000';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists aya_b2b_guard_invoice_mutation on public.aya_b2b_invoices;
create trigger aya_b2b_guard_invoice_mutation
before update or delete on public.aya_b2b_invoices
for each row execute function public.aya_b2b_guard_invoice_mutation_v1();

create or replace function public.aya_b2b_guard_verified_payment_transition_v1()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'verified_paid' and old.status <> 'verified_paid' then
    if coalesce(current_setting('aya.payment_verification', true), '') <> 'on' then
      raise exception using message = 'verified_paid_requires_trusted_verification', errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists aya_b2b_guard_verified_payment_transition on public.aya_b2b_payment_attempts;
create trigger aya_b2b_guard_verified_payment_transition
before update on public.aya_b2b_payment_attempts
for each row execute function public.aya_b2b_guard_verified_payment_transition_v1();

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
    select * into v_obligation
    from public.aya_b2b_payment_obligations
    where id = v_attempt.obligation_id;

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

  if v_obligation.status = 'paid' then
    raise exception using message = 'payment_obligation_already_paid', errcode = '55000';
  end if;

  if v_attempt.amount_requested > (v_obligation.amount_due - v_obligation.amount_verified_paid) then
    raise exception using message = 'payment_amount_exceeds_outstanding', errcode = '22003';
  end if;

  v_new_paid := v_obligation.amount_verified_paid + v_attempt.amount_requested;
  v_new_status := case
    when v_new_paid = v_obligation.amount_due then 'paid'
    else 'partially_paid'
  end;

  perform set_config('aya.payment_verification', 'on', true);

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

  perform set_config('aya.payment_verification', 'off', true);

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

revoke all on function public.aya_b2b_guard_invoice_mutation_v1() from public, anon, authenticated;
revoke all on function public.aya_b2b_guard_verified_payment_transition_v1() from public, anon, authenticated;
revoke all on function public.aya_b2b_apply_verified_payment_v1(uuid, timestamptz, text) from public, anon, authenticated;

grant execute on function public.aya_b2b_guard_invoice_mutation_v1() to service_role;
grant execute on function public.aya_b2b_guard_verified_payment_transition_v1() to service_role;
grant execute on function public.aya_b2b_apply_verified_payment_v1(uuid, timestamptz, text) to service_role;
