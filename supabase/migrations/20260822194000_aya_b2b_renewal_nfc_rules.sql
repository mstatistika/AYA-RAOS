-- AYA RAOS — 6+6 commitment / NFC eligibility guard
-- Eligibility is a state outcome, not an automatic pricing change.

create or replace function public.aya_b2b_nfc_eligibility_v1(p_relationship_id uuid)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public
as $$
declare
  v_count integer;
  v_active_months integer;
  v_last_end date;
  v_status text;
begin
  select status into v_status from public.aya_b2b_relationships where id=p_relationship_id;
  if v_status is null then return jsonb_build_object('eligible',false,'reason','Relationship not found'); end if;
  select count(*), coalesce(sum(commitment_months),0), max(commitment_end)
    into v_count,v_active_months,v_last_end
  from public.aya_b2b_commercial_summaries
  where relationship_id=p_relationship_id and status='confirmed';
  if v_count < 2 or v_active_months < 12 then
    return jsonb_build_object('eligible',false,'reason','Requires two confirmed 6-month commitment periods','confirmed_periods',v_count,'active_months',v_active_months);
  end if;
  return jsonb_build_object('eligible',true,'reason','6+6 active commitment months completed','confirmed_periods',v_count,'active_months',v_active_months,'latest_commitment_end',v_last_end);
end;
$$;

create or replace function public.aya_b2b_mark_nfc_eligible_v1(p_relationship_id uuid)
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
declare v_check jsonb;
begin
  v_check:=public.aya_b2b_nfc_eligibility_v1(p_relationship_id);
  if coalesce((v_check->>'eligible')::boolean,false) is not true then return false; end if;
  update public.aya_b2b_relationships set lifecycle_stage='nfc',status='nfc',updated_at=now() where id=p_relationship_id and status in ('active','grace');
  insert into public.aya_b2b_status_events(relationship_id,to_status,event_type,reason,metadata)
    values(p_relationship_id,'nfc','nfc_eligibility','Completed 6+6 active commitment months',v_check)
    on conflict do nothing;
  return true;
end;
$$;

revoke all on function public.aya_b2b_nfc_eligibility_v1(uuid) from anon,authenticated;
revoke all on function public.aya_b2b_mark_nfc_eligible_v1(uuid) from anon,authenticated;
