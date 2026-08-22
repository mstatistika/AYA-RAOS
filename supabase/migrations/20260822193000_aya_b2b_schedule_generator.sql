-- AYA RAOS — deterministic recurring delivery schedule generator
-- Generates immutable occurrence rows from a confirmed commercial snapshot.
-- Existing occurrences are never overwritten; caller supplies a new schedule window.

create or replace function public.aya_b2b_generate_schedule_v1(
  p_relationship_id uuid,
  p_commercial_summary_id uuid,
  p_cadence text,
  p_start_date date,
  p_end_date date,
  p_address_snapshot jsonb,
  p_goods_value bigint,
  p_shipping_value bigint
) returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  d date;
  next_d date;
  inserted_count integer := 0;
  scheduled_at timestamptz;
begin
  if p_cadence not in ('W1','W2','M1','M2') then raise exception 'Invalid cadence'; end if;
  if p_start_date > p_end_date then raise exception 'Invalid schedule window'; end if;
  if not exists(select 1 from public.aya_b2b_relationships where id=p_relationship_id) then raise exception 'Relationship not found'; end if;
  if not exists(select 1 from public.aya_b2b_commercial_summaries where id=p_commercial_summary_id and status='confirmed') then raise exception 'Confirmed commercial snapshot not found'; end if;

  d := case p_cadence
    when 'W1' then p_start_date + ((8-extract(isodow from p_start_date)::int)%7)
    when 'W2' then p_start_date + ((8-extract(isodow from p_start_date)::int)%7)
    when 'M1' then date_trunc('month',p_start_date)::date + ((8-extract(isodow from date_trunc('month',p_start_date)::date)::int)%7)
    when 'M2' then date_trunc('month',p_start_date)::date + ((8-extract(isodow from date_trunc('month',p_start_date)::date)::int)%7)
  end;

  while d <= p_end_date loop
    scheduled_at := ((d::text || ' 09:00:00')::timestamp at time zone 'Asia/Jakarta');
    insert into public.aya_b2b_delivery_occurrences(
      relationship_id,commercial_summary_id,cadence,scheduled_at,h3_lock_at,
      address_snapshot,goods_value_snapshot,shipping_value_snapshot,status,commercially_consumed
    ) values (
      p_relationship_id,p_commercial_summary_id,p_cadence,scheduled_at,scheduled_at-interval '3 days',
      coalesce(p_address_snapshot,'{}'::jsonb),greatest(p_goods_value,0),greatest(p_shipping_value,0),'scheduled',false
    ) on conflict do nothing;
    if found then inserted_count := inserted_count + 1; end if;

    d := case p_cadence
      when 'W1' then d + 7
      when 'W2' then d + 14
      when 'M1' then (d + interval '1 month')::date
      when 'M2' then (d + interval '2 months')::date
    end;
  end loop;
  return inserted_count;
end;
$$;

revoke all on function public.aya_b2b_generate_schedule_v1(uuid,uuid,text,date,date,jsonb,bigint,bigint) from anon,authenticated;
