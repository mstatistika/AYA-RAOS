-- AYA RAOS — B2B pause/cadence rule engine
-- System-driven validation; admin review only where canonical says reduction/removal.

create or replace function public.aya_b2b_validate_voluntary_pause_v1(
  p_relationship_id uuid,
  p_pause_kind text,
  p_requested_weeks integer,
  p_starts_on date
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_cadence text;
  v_lifecycle text;
  v_total_fixed integer;
  v_monthly integer;
  v_commitment_end date;
begin
  select lifecycle_stage into v_lifecycle from public.aya_b2b_relationships where id=p_relationship_id;
  if v_lifecycle is null then raise exception 'Relationship not found'; end if;
  select commitment_months, commitment_end into v_total_fixed, v_commitment_end
  from public.aya_b2b_commercial_summaries
  where relationship_id=p_relationship_id and status='confirmed'
  order by version_no desc limit 1;

  if p_pause_kind='fixed' then
    if p_requested_weeks < 1 or p_requested_weeks > 4 then
      return jsonb_build_object('allowed',false,'reason','Fixed commitment pause maximum is 4 weeks total');
    end if;
    select coalesce(sum(coalesce(approved_weeks,0)),0) into v_total_fixed
    from public.aya_b2b_voluntary_pauses
    where relationship_id=p_relationship_id and pause_kind='fixed' and status in ('approved','active','completed');
    if v_total_fixed + p_requested_weeks > 4 then
      return jsonb_build_object('allowed',false,'reason','Fixed commitment pause total would exceed 4 weeks');
    end if;
    select coalesce(sum(coalesce(approved_weeks,0)),0) into v_monthly
    from public.aya_b2b_voluntary_pauses
    where relationship_id=p_relationship_id and pause_kind='fixed' and status in ('approved','active')
      and date_trunc('month',starts_on)=date_trunc('month',p_starts_on);
    if v_monthly + p_requested_weeks > 3 then
      return jsonb_build_object('allowed',false,'reason','Fixed commitment pause maximum is 3 weeks in one month');
    end if;
  elsif p_pause_kind='nfc' then
    if v_lifecycle <> 'nfc' then
      return jsonb_build_object('allowed',false,'reason','NFC pause is available only to NFC relationships');
    end if;
    select commitment_months into v_total_fixed
    from public.aya_b2b_commercial_summaries
    where relationship_id=p_relationship_id and status='confirmed'
    order by version_no desc limit 1;
    if p_requested_weeks <> 1 then
      return jsonb_build_object('allowed',false,'reason','NFC voluntary pause maximum is 1 week');
    end if;
  else
    return jsonb_build_object('allowed',false,'reason','Unknown pause kind');
  end if;

  return jsonb_build_object('allowed',true,'requested_weeks',p_requested_weeks,'starts_on',p_starts_on,'commitment_end',v_commitment_end);
end;
$$;

create or replace function public.aya_b2b_validate_cadence_change_v1(
  p_relationship_id uuid,
  p_from_cadence text,
  p_to_cadence text
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_paid bigint;
  v_committed bigint;
  v_rank_from integer;
  v_rank_to integer;
begin
  v_rank_from := case p_from_cadence when 'M2' then 4 when 'M1' then 3 when 'W2' then 2 when 'W1' then 1 else 0 end;
  v_rank_to := case p_to_cadence when 'M2' then 4 when 'M1' then 3 when 'W2' then 2 when 'W1' then 1 else 0 end;
  if v_rank_from=0 or v_rank_to=0 then return jsonb_build_object('allowed',false,'reason','Cadence must be W1/W2/M1/M2'); end if;
  if v_rank_to >= v_rank_from then return jsonb_build_object('allowed',false,'reason','Cadence may only move toward more frequent delivery'); end if;
  select coalesce(sum(amount_verified_paid),0) into v_paid
  from public.aya_b2b_payment_obligations where relationship_id=p_relationship_id and status<>'cancelled';
  select coalesce(total_committed_value,0) into v_committed
  from public.aya_b2b_commercial_summaries
  where relationship_id=p_relationship_id and status='confirmed'
  order by version_no desc limit 1;
  if v_committed=0 then return jsonb_build_object('allowed',false,'reason','Confirmed commitment value is not available'); end if;
  if v_paid * 2 < v_committed then
    return jsonb_build_object('allowed',false,'reason','Cadence change requires at least 50% of total commitment paid');
  end if;
  return jsonb_build_object('allowed',true,'paid',v_paid,'committed',v_committed,'payment_protection',case when v_paid>=v_committed then '100%' else '50%' end);
end;
$$;

create or replace function public.aya_b2b_commit_pause_v1(p_pause_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare
  r record;
  v_check jsonb;
  v_weeks integer;
begin
  select * into r from public.aya_b2b_voluntary_pauses where id=p_pause_id for update;
  if not found or r.status <> 'requested' then return false; end if;
  v_check := public.aya_b2b_validate_voluntary_pause_v1(r.relationship_id,r.pause_kind,r.requested_weeks,r.starts_on);
  if coalesce((v_check->>'allowed')::boolean,false) is not true then raise exception '%', v_check->>'reason'; end if;
  v_weeks := r.requested_weeks;
  update public.aya_b2b_voluntary_pauses
    set approved_weeks=v_weeks, ends_on=r.starts_on + (v_weeks*7-1),
        status='approved', commitment_extension_days=v_weeks*7, updated_at=now()
    where id=p_pause_id;
  update public.aya_b2b_commercial_summaries
    set commitment_end=commitment_end + (v_weeks*7), updated_at=now()
    where id=(select id from public.aya_b2b_commercial_summaries where relationship_id=r.relationship_id and status='confirmed' order by version_no desc limit 1);
  return true;
end;
$$;

revoke all on function public.aya_b2b_validate_voluntary_pause_v1(uuid,text,integer,date) from anon,authenticated;
revoke all on function public.aya_b2b_validate_cadence_change_v1(uuid,text,text) from anon,authenticated;
revoke all on function public.aya_b2b_commit_pause_v1(uuid) from anon,authenticated;
