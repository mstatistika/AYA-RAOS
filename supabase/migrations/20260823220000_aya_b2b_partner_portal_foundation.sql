-- ============================================================
-- AYA RAOS — B2B PARTNER PORTAL FOUNDATION v1
-- Customer-facing RLS + bootstrap / activate / snapshot RPCs.
-- Additive only. Does not alter commercial truth generators.
-- Auth remains Supabase Auth (email OTP primary).
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Helper: is the caller an active member of company?
-- ------------------------------------------------------------
create or replace function public.aya_b2b_is_company_member_v1(p_company_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.aya_b2b_company_members m
    where m.company_id = p_company_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.aya_b2b_member_company_ids_v1()
returns setof uuid
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select m.company_id
  from public.aya_b2b_company_members m
  where m.user_id = auth.uid()
    and m.status = 'active';
$$;

-- ------------------------------------------------------------
-- RLS policies (authenticated B2B partner — own data only)
-- Tables were previously service_role-only; add SELECT for members.
-- ------------------------------------------------------------

drop policy if exists aya_b2b_profiles_select_own on public.aya_b2b_user_profiles;
create policy aya_b2b_profiles_select_own
  on public.aya_b2b_user_profiles
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists aya_b2b_profiles_update_own on public.aya_b2b_user_profiles;
create policy aya_b2b_profiles_update_own
  on public.aya_b2b_user_profiles
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists aya_b2b_profiles_insert_own on public.aya_b2b_user_profiles;
create policy aya_b2b_profiles_insert_own
  on public.aya_b2b_user_profiles
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists aya_b2b_companies_select_member on public.aya_b2b_companies;
create policy aya_b2b_companies_select_member
  on public.aya_b2b_companies
  for select
  to authenticated
  using (public.aya_b2b_is_company_member_v1(id));

drop policy if exists aya_b2b_members_select_own on public.aya_b2b_company_members;
create policy aya_b2b_members_select_own
  on public.aya_b2b_company_members
  for select
  to authenticated
  using (user_id = auth.uid() or public.aya_b2b_is_company_member_v1(company_id));

drop policy if exists aya_b2b_resp_select_member on public.aya_b2b_company_member_responsibilities;
create policy aya_b2b_resp_select_member
  on public.aya_b2b_company_member_responsibilities
  for select
  to authenticated
  using (public.aya_b2b_is_company_member_v1(company_id));

drop policy if exists aya_b2b_contacts_select_member on public.aya_b2b_company_contact_channels;
create policy aya_b2b_contacts_select_member
  on public.aya_b2b_company_contact_channels
  for select
  to authenticated
  using (public.aya_b2b_is_company_member_v1(company_id));

drop policy if exists aya_b2b_rel_select_member on public.aya_b2b_relationships;
create policy aya_b2b_rel_select_member
  on public.aya_b2b_relationships
  for select
  to authenticated
  using (public.aya_b2b_is_company_member_v1(company_id));

drop policy if exists aya_b2b_sum_select_member on public.aya_b2b_commercial_summaries;
create policy aya_b2b_sum_select_member
  on public.aya_b2b_commercial_summaries
  for select
  to authenticated
  using (
    exists (
      select 1 from public.aya_b2b_relationships r
      where r.id = relationship_id
        and public.aya_b2b_is_company_member_v1(r.company_id)
    )
  );

drop policy if exists aya_b2b_sum_items_select_member on public.aya_b2b_commercial_summary_items;
create policy aya_b2b_sum_items_select_member
  on public.aya_b2b_commercial_summary_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.aya_b2b_commercial_summaries s
      join public.aya_b2b_relationships r on r.id = s.relationship_id
      where s.id = summary_id
        and public.aya_b2b_is_company_member_v1(r.company_id)
    )
  );

drop policy if exists aya_b2b_del_select_member on public.aya_b2b_delivery_occurrences;
create policy aya_b2b_del_select_member
  on public.aya_b2b_delivery_occurrences
  for select
  to authenticated
  using (
    exists (
      select 1 from public.aya_b2b_relationships r
      where r.id = relationship_id
        and public.aya_b2b_is_company_member_v1(r.company_id)
    )
  );

drop policy if exists aya_b2b_credit_select_member on public.aya_b2b_credit_ledger;
create policy aya_b2b_credit_select_member
  on public.aya_b2b_credit_ledger
  for select
  to authenticated
  using (
    exists (
      select 1 from public.aya_b2b_relationships r
      where r.id = relationship_id
        and public.aya_b2b_is_company_member_v1(r.company_id)
    )
  );

grant select on table
  public.aya_b2b_user_profiles,
  public.aya_b2b_companies,
  public.aya_b2b_company_members,
  public.aya_b2b_company_member_responsibilities,
  public.aya_b2b_company_contact_channels,
  public.aya_b2b_relationships,
  public.aya_b2b_commercial_summaries,
  public.aya_b2b_commercial_summary_items,
  public.aya_b2b_delivery_occurrences,
  public.aya_b2b_credit_ledger
to authenticated;

grant insert, update on table public.aya_b2b_user_profiles to authenticated;

grant execute on function public.aya_b2b_is_company_member_v1(uuid) to authenticated;
grant execute on function public.aya_b2b_member_company_ids_v1() to authenticated;

create or replace function public.aya_b2b_partner_bootstrap_v1(
  p_full_name text default null,
  p_email text default null,
  p_phone_e164 text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_name text;
  v_email text;
  v_phone text;
  v_has_membership boolean;
begin
  if v_uid is null then
    raise exception using message = 'not_authenticated', errcode = '42501';
  end if;

  v_name := nullif(btrim(coalesce(p_full_name, '')), '');
  if v_name is null or char_length(v_name) < 2 then
    v_name := coalesce(
      nullif(btrim(coalesce(p_email, '')), ''),
      'Mitra AYA'
    );
    if char_length(v_name) > 160 then
      v_name := left(v_name, 160);
    end if;
  end if;

  v_email := nullif(lower(btrim(coalesce(p_email, ''))), '');
  v_phone := nullif(btrim(coalesce(p_phone_e164, '')), '');
  if v_phone is not null and v_phone !~ '^\+[1-9][0-9]{6,14}$' then
    v_phone := null;
  end if;

  insert into public.aya_b2b_user_profiles (user_id, full_name, email, phone_e164, email_verified_at)
  values (
    v_uid,
    v_name,
    v_email,
    v_phone,
    case when v_email is not null then now() else null end
  )
  on conflict (user_id) do update set
    full_name = case
      when char_length(btrim(excluded.full_name)) >= 2 then excluded.full_name
      else aya_b2b_user_profiles.full_name
    end,
    email = coalesce(excluded.email, aya_b2b_user_profiles.email),
    phone_e164 = coalesce(excluded.phone_e164, aya_b2b_user_profiles.phone_e164),
    email_verified_at = coalesce(aya_b2b_user_profiles.email_verified_at, excluded.email_verified_at),
    updated_at = now();

  select exists (
    select 1 from public.aya_b2b_company_members m
    where m.user_id = v_uid and m.status = 'active'
  ) into v_has_membership;

  return jsonb_build_object(
    'user_id', v_uid,
    'has_membership', v_has_membership,
    'profile_exists', true
  );
end;
$$;

create or replace function public.aya_b2b_partner_activate_v1(
  p_company_name text,
  p_business_context text default null,
  p_full_name text default null,
  p_phone_e164 text default null,
  p_responsibilities text[] default array['primary_owner_pic']
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_company_id uuid;
  v_name text := btrim(coalesce(p_company_name, ''));
  v_full text := btrim(coalesce(p_full_name, ''));
  v_phone text := nullif(btrim(coalesce(p_phone_e164, '')), '');
  v_ctx text := nullif(btrim(coalesce(p_business_context, '')), '');
  v_resp text;
  v_allowed text[] := array['primary_owner_pic','finance','purchasing','operational_delivery_pic'];
begin
  if v_uid is null then
    raise exception using message = 'not_authenticated', errcode = '42501';
  end if;

  if char_length(v_name) < 2 or char_length(v_name) > 200 then
    raise exception using message = 'invalid_company_name', errcode = '22023';
  end if;

  if char_length(v_full) < 2 then
    v_full := 'Mitra AYA';
  end if;

  if v_phone is not null and v_phone !~ '^\+[1-9][0-9]{6,14}$' then
    raise exception using message = 'invalid_phone_e164', errcode = '22023';
  end if;

  insert into public.aya_b2b_user_profiles (user_id, full_name, phone_e164)
  values (v_uid, left(v_full, 160), v_phone)
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    phone_e164 = coalesce(excluded.phone_e164, aya_b2b_user_profiles.phone_e164),
    updated_at = now();

  select m.company_id into v_company_id
  from public.aya_b2b_company_members m
  where m.user_id = v_uid and m.status = 'active'
  limit 1;

  if v_company_id is not null then
    return jsonb_build_object(
      'company_id', v_company_id,
      'already_member', true
    );
  end if;

  insert into public.aya_b2b_companies (company_name, business_context, status)
  values (v_name, v_ctx, 'draft')
  returning id into v_company_id;

  insert into public.aya_b2b_company_members (company_id, user_id, is_primary, status)
  values (v_company_id, v_uid, true, 'active');

  if p_responsibilities is null or array_length(p_responsibilities, 1) is null then
    p_responsibilities := array['primary_owner_pic'];
  end if;

  foreach v_resp in array p_responsibilities
  loop
    if v_resp = any (v_allowed) then
      insert into public.aya_b2b_company_member_responsibilities (company_id, user_id, responsibility)
      values (v_company_id, v_uid, v_resp)
      on conflict do nothing;
    end if;
  end loop;

  if exists (select 1 from auth.users u where u.id = v_uid and u.email is not null) then
    insert into public.aya_b2b_company_contact_channels (
      company_id, channel_type, channel_value, verified_at, is_primary, active
    )
    select v_company_id, 'email', lower(u.email), now(), true, true
    from auth.users u
    where u.id = v_uid
    on conflict do nothing;
  end if;

  if v_phone is not null then
    insert into public.aya_b2b_company_contact_channels (
      company_id, channel_type, channel_value, is_primary, active
    )
    values (v_company_id, 'whatsapp', v_phone, true, true)
    on conflict do nothing;
  end if;

  return jsonb_build_object(
    'company_id', v_company_id,
    'already_member', false,
    'status', 'draft'
  );
end;
$$;

create or replace function public.aya_b2b_partner_snapshot_v1()
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile jsonb;
  v_companies jsonb;
  v_memberships jsonb;
  v_relationships jsonb;
  v_summaries jsonb;
  v_deliveries jsonb;
  v_credits jsonb;
  v_company_ids uuid[];
  v_rel_ids uuid[];
begin
  if v_uid is null then
    raise exception using message = 'not_authenticated', errcode = '42501';
  end if;

  select to_jsonb(p) into v_profile
  from public.aya_b2b_user_profiles p
  where p.user_id = v_uid;

  select coalesce(jsonb_agg(to_jsonb(m) || jsonb_build_object(
    'aya_b2b_companies', to_jsonb(c)
  )), '[]'::jsonb)
  into v_memberships
  from public.aya_b2b_company_members m
  join public.aya_b2b_companies c on c.id = m.company_id
  where m.user_id = v_uid and m.status = 'active';

  select array_agg(m.company_id) into v_company_ids
  from public.aya_b2b_company_members m
  where m.user_id = v_uid and m.status = 'active';

  if v_company_ids is null then
    return jsonb_build_object(
      'profile', v_profile,
      'companies', '[]'::jsonb,
      'memberships', '[]'::jsonb,
      'relationships', '[]'::jsonb,
      'summaries', '[]'::jsonb,
      'deliveries', '[]'::jsonb,
      'credits', '[]'::jsonb
    );
  end if;

  select coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb)
  into v_companies
  from public.aya_b2b_companies c
  where c.id = any (v_company_ids);

  select coalesce(jsonb_agg(to_jsonb(r) order by r.opened_at desc), '[]'::jsonb)
  into v_relationships
  from public.aya_b2b_relationships r
  where r.company_id = any (v_company_ids);

  select array_agg(r.id) into v_rel_ids
  from public.aya_b2b_relationships r
  where r.company_id = any (v_company_ids);

  if v_rel_ids is null then
    v_summaries := '[]'::jsonb;
    v_deliveries := '[]'::jsonb;
    v_credits := '[]'::jsonb;
  else
    select coalesce(jsonb_agg(to_jsonb(s) order by s.version_no desc), '[]'::jsonb)
    into v_summaries
    from public.aya_b2b_commercial_summaries s
    where s.relationship_id = any (v_rel_ids);

    select coalesce(jsonb_agg(to_jsonb(d) order by d.scheduled_at desc), '[]'::jsonb)
    into v_deliveries
    from (
      select * from public.aya_b2b_delivery_occurrences
      where relationship_id = any (v_rel_ids)
      order by scheduled_at desc
      limit 50
    ) d;

    select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at desc), '[]'::jsonb)
    into v_credits
    from (
      select * from public.aya_b2b_credit_ledger
      where relationship_id = any (v_rel_ids)
      order by created_at desc
      limit 50
    ) c;
  end if;

  return jsonb_build_object(
    'profile', v_profile,
    'companies', v_companies,
    'memberships', v_memberships,
    'relationships', v_relationships,
    'summaries', v_summaries,
    'deliveries', v_deliveries,
    'credits', v_credits
  );
end;
$$;

revoke all on function public.aya_b2b_partner_bootstrap_v1(text, text, text) from public, anon;
revoke all on function public.aya_b2b_partner_activate_v1(text, text, text, text, text[]) from public, anon;
revoke all on function public.aya_b2b_partner_snapshot_v1() from public, anon;

grant execute on function public.aya_b2b_partner_bootstrap_v1(text, text, text) to authenticated, service_role;
grant execute on function public.aya_b2b_partner_activate_v1(text, text, text, text, text[]) to authenticated, service_role;
grant execute on function public.aya_b2b_partner_snapshot_v1() to authenticated, service_role;

comment on function public.aya_b2b_partner_bootstrap_v1 is
  'Partner portal: ensure aya_b2b_user_profiles row exists for auth.uid() on first login.';
comment on function public.aya_b2b_partner_activate_v1 is
  'Partner portal: create draft company + primary membership + responsibilities for the caller.';
comment on function public.aya_b2b_partner_snapshot_v1 is
  'Partner portal: read-only commercial snapshot scoped to companies the caller belongs to.';
