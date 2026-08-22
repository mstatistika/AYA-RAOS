-- Preserve confirmed Commercial Summary immutability.
-- Voluntary pause extends the effective commitment end without mutating the confirmed snapshot.

create or replace function public.aya_b2b_current_commitment_end_v1(p_relationship_id uuid)
returns date
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(
    (select commitment_end from public.aya_b2b_commercial_summaries
      where relationship_id=p_relationship_id and status='confirmed'
      order by version_no desc limit 1),
    current_date
  ) + coalesce((select sum(commitment_extension_days) from public.aya_b2b_voluntary_pauses
      where relationship_id=p_relationship_id and status in ('approved','active','completed')),0)::int;
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
    set approved_weeks=v_weeks,
        ends_on=r.starts_on + (v_weeks*7-1),
        status='approved',
        commitment_extension_days=v_weeks*7,
        updated_at=now()
    where id=p_pause_id;
  insert into public.aya_b2b_status_events(relationship_id,to_status,event_type,source_reference,reason,metadata)
    values(r.relationship_id,'active','voluntary_pause_approved',p_pause_id::text,'Approved pause; confirmed commercial snapshot remains immutable',jsonb_build_object('extension_days',v_weeks*7));
  return true;
end;
$$;

revoke all on function public.aya_b2b_current_commitment_end_v1(uuid) from anon,authenticated;
revoke all on function public.aya_b2b_commit_pause_v1(uuid) from anon,authenticated;
