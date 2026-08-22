-- ============================================================
-- AYA RAOS — B2B CUSTOMER IDENTITY FOUNDATION v1
-- Additive migration for B2B customer accounts.
-- Keeps customer identity separate from AYA Admin access.
-- Authentication remains Supabase Auth; email/OTP provider activation
-- is intentionally not implemented by this migration.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.aya_b2b_user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone_e164 text,
  email text,
  phone_verified_at timestamptz,
  email_verified_at timestamptz,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aya_b2b_user_profiles_name_check check (char_length(btrim(full_name)) between 2 and 160),
  constraint aya_b2b_user_profiles_phone_check check (phone_e164 is null or phone_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  constraint aya_b2b_user_profiles_email_check check (email is null or char_length(email) between 3 and 320),
  constraint aya_b2b_user_profiles_status_check check (status in ('active','disabled'))
);

create unique index if not exists aya_b2b_user_profiles_phone_uidx
  on public.aya_b2b_user_profiles(phone_e164)
  where phone_e164 is not null;

create unique index if not exists aya_b2b_user_profiles_email_uidx
  on public.aya_b2b_user_profiles(lower(email))
  where email is not null;

create table if not exists public.aya_b2b_companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  business_context text,
  status text not null default 'draft',
  verified_email_required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aya_b2b_companies_name_check check (char_length(btrim(company_name)) between 2 and 200),
  constraint aya_b2b_companies_status_check check (status in ('draft','active','suspended','closed'))
);

create table if not exists public.aya_b2b_company_members (
  company_id uuid not null references public.aya_b2b_companies(id) on delete cascade,
  user_id uuid not null references public.aya_b2b_user_profiles(user_id) on delete cascade,
  is_primary boolean not null default false,
  status text not null default 'active',
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (company_id, user_id),
  constraint aya_b2b_company_members_status_check check (status in ('active','disabled','removed'))
);

create unique index if not exists aya_b2b_company_one_primary_uidx
  on public.aya_b2b_company_members(company_id)
  where is_primary and status = 'active';

create index if not exists aya_b2b_company_members_user_idx
  on public.aya_b2b_company_members(user_id, status);

create table if not exists public.aya_b2b_company_member_responsibilities (
  company_id uuid not null,
  user_id uuid not null,
  responsibility text not null,
  created_at timestamptz not null default now(),
  primary key (company_id, user_id, responsibility),
  foreign key (company_id, user_id)
    references public.aya_b2b_company_members(company_id, user_id)
    on delete cascade,
  constraint aya_b2b_company_responsibility_check check (
    responsibility in ('primary_owner_pic','finance','purchasing','operational_delivery_pic')
  )
);

create table if not exists public.aya_b2b_company_contact_channels (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.aya_b2b_companies(id) on delete cascade,
  channel_type text not null,
  channel_value text not null,
  verified_at timestamptz,
  is_primary boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aya_b2b_company_contact_type_check check (channel_type in ('email','whatsapp')),
  constraint aya_b2b_company_contact_value_check check (char_length(btrim(channel_value)) between 3 and 320)
);

create unique index if not exists aya_b2b_company_contact_unique_uidx
  on public.aya_b2b_company_contact_channels(company_id, channel_type, lower(channel_value));

create unique index if not exists aya_b2b_company_primary_channel_uidx
  on public.aya_b2b_company_contact_channels(company_id, channel_type)
  where is_primary and active;

create or replace function public.aya_b2b_company_has_verified_email_v1(p_company_id uuid)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.aya_b2b_company_contact_channels c
    where c.company_id = p_company_id
      and c.channel_type = 'email'
      and c.active
      and c.verified_at is not null
  );
$$;

alter table public.aya_b2b_user_profiles enable row level security;
alter table public.aya_b2b_companies enable row level security;
alter table public.aya_b2b_company_members enable row level security;
alter table public.aya_b2b_company_member_responsibilities enable row level security;
alter table public.aya_b2b_company_contact_channels enable row level security;

revoke all on table
  public.aya_b2b_user_profiles,
  public.aya_b2b_companies,
  public.aya_b2b_company_members,
  public.aya_b2b_company_member_responsibilities,
  public.aya_b2b_company_contact_channels
from public, anon, authenticated;

revoke all on function public.aya_b2b_company_has_verified_email_v1(uuid)
from public, anon, authenticated;

grant select, insert, update, delete on table
  public.aya_b2b_user_profiles,
  public.aya_b2b_companies,
  public.aya_b2b_company_members,
  public.aya_b2b_company_member_responsibilities,
  public.aya_b2b_company_contact_channels
to service_role;

grant execute on function public.aya_b2b_company_has_verified_email_v1(uuid)
to service_role;

comment on table public.aya_b2b_user_profiles is
  'B2B customer identity profile mapped 1:1 to auth.users; separate from AYA Admin users.';
comment on table public.aya_b2b_companies is
  'B2B customer company/account root. Commercial relationship tables attach here.';
comment on table public.aya_b2b_company_members is
  'Many-to-many Company to individual B2B users; one active primary member per company.';
comment on table public.aya_b2b_company_member_responsibilities is
  'A B2B person may hold multiple approved company responsibilities.';
comment on table public.aya_b2b_company_contact_channels is
  'Company-level official contact channels. Verified email is required later before Commercial Summary confirmation.';
