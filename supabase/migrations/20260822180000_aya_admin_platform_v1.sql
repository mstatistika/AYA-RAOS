-- AYA RAOS Admin Platform v1
-- Idempotent forward migration. Requires the canonical AYA testimonial + B2B foundations.

create schema if not exists private;

create table if not exists public.aya_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.aya_admin_functions (
  function_key text primary key,
  domain text not null,
  label text not null,
  description text,
  system_only boolean not null default false,
  created_at timestamptz not null default now()
);
create table if not exists public.aya_admin_roles (
  id uuid primary key default gen_random_uuid(),
  role_code text not null unique,
  role_name text not null,
  description text,
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.aya_admin_role_functions (
  role_id uuid not null references public.aya_admin_roles(id) on delete cascade,
  function_key text not null references public.aya_admin_functions(function_key) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(role_id,function_key)
);
create table if not exists public.aya_admin_user_roles (
  user_id uuid not null references public.aya_admin_users(user_id) on delete cascade,
  role_id uuid not null references public.aya_admin_roles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,role_id)
);
create table if not exists public.aya_admin_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id),
  effective_function text,
  entity_type text not null,
  entity_id text,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  reason text,
  reference text,
  created_at timestamptz not null default now()
);
create table if not exists public.aya_cms_slots (
  slot_key text primary key,
  area text not null,
  label text not null,
  draft_content jsonb not null default '{}'::jsonb,
  published_content jsonb,
  draft_version integer not null default 1,
  published_version integer,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
create table if not exists public.aya_cms_versions (
  id bigint generated always as identity primary key,
  slot_key text not null references public.aya_cms_slots(slot_key) on delete restrict,
  version integer not null,
  content jsonb not null,
  version_status text not null check(version_status in ('draft','published','rollback_source')),
  created_by uuid references auth.users(id),
  reason text,
  created_at timestamptz not null default now(),
  unique(slot_key,version,version_status)
);
create table if not exists public.aya_media_assets (
  id uuid primary key default gen_random_uuid(),
  domain text not null,
  asset_kind text not null,
  bucket_name text not null,
  object_path text not null,
  original_filename text,
  mime_type text,
  size_bytes bigint,
  alt_text text,
  lifecycle_status text not null default 'active' check(lifecycle_status in ('active','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(bucket_name,object_path)
);
create table if not exists public.aya_testimonial_publish_assets (
  id uuid primary key default gen_random_uuid(),
  testimonial_id uuid not null references public.aya_testimonials(id) on delete restrict,
  asset_type text not null check(asset_type in ('edited_photo','rendered_video')),
  media_asset_id uuid references public.aya_media_assets(id) on delete restrict,
  overlay_name text,
  overlay_place text,
  render_status text not null default 'draft' check(render_status in ('draft','rendering','ready','failed','published','archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.aya_admin_functions(function_key,domain,label,description,system_only) values
('dashboard.view','Dashboard','View dashboard','Read attention-first admin dashboard',false),
('website.view','Website / CMS','View CMS','Read CMS slots and versions',false),
('website.edit','Website / CMS','Edit draft','Edit content-slot drafts',false),
('website.preview','Website / CMS','Preview draft','Preview CMS draft',false),
('website.publish','Website / CMS','Publish','Publish CMS version',false),
('website.rollback','Website / CMS','Rollback','Restore content from version history',false),
('media.view','Media','View media','Read central media registry',false),
('media.upload','Media','Upload media','Upload/register media assets',false),
('media.edit','Media','Edit media','Edit media metadata',false),
('media.archive','Media','Archive media','Archive media asset',false),
('product.view','Product Master','View products','Read Product Master',false),
('product.edit','Product Master','Edit products','Edit Product Master identity/state',false),
('product.variant.edit','Product Master','Edit variants','Edit Product Master variants',false),
('product.b2b.manage','Product Master','Manage B2B product config','Manage supply eligibility and measurements',false),
('b2c.view','B2C Operations','View B2C','Read B2C orders',false),
('b2c.order.review','B2C Operations','Review B2C order','Inspect B2C order details',false),
('b2c.order.status.edit','B2C Operations','Edit order status','Update operational B2C order status',false),
('b2b.view','B2B Operations','View B2B','Read B2B operational state',false),
('b2b.cogs.view','B2B Operations','View COGS','Read internal B2B costs',false),
('b2b.cogs.edit','B2B Operations','Edit COGS','Edit B2B cost inputs',false),
('b2b.unit_price.edit','B2B Operations','Edit final unit price','Edit Final Unit Price',false),
('b2b.reduction.review','B2B Operations','Review reductions','Review reductions',false),
('b2b.force_majeure.review','B2B Operations','Review force majeure','Verify force-majeure cases',false),
('b2b.nfc.review','B2B Operations','Review NFC','Review flagged NFC eligibility',false),
('b2b.delivery.exception','B2B Operations','Manage delivery exception','Record authorized delivery exceptions',false),
('termination.recommend','B2B Operations','Recommend termination','Submit termination recommendation',false),
('termination.execute','B2B Operations','Execute termination','Execute authorized termination',false),
('testimonial.view','Testimonials','View testimonials','Read submissions',false),
('testimonial.moderate','Testimonials','Moderate','Approve/reject submission',false),
('testimonial.media.download','Testimonials','Download original','Access original media',false),
('testimonial.publish_asset.upload','Testimonials','Upload publish asset','Register publish asset',false),
('testimonial.overlay.edit','Testimonials','Edit overlay','Edit video overlay metadata',false),
('testimonial.render.generate','Testimonials','Generate render','Trigger publish render',false),
('testimonial.preview','Testimonials','Preview','Preview publish-ready testimonial',false),
('testimonial.publish','Testimonials','Publish','Publish/unpublish testimonial',false),
('testimonial.display_order','Testimonials','Display order','Edit display order',false),
('finance.view','Finance','View finance','Read finance overview',false),
('invoice.view','Finance','View invoices','Read invoices',false),
('invoice.void_reissue','Finance','Void/reissue invoice','Controlled invoice correction',false),
('payment.view','Finance','View payments','Read payment attempts/status',false),
('settlement.view','Finance','View settlements','Read settlements',false),
('credit.view','Finance','View credits','Read Kredit Pasokan ledger',false),
('credit.adjust','Finance','Adjust credit','Controlled credit adjustment',false),
('refund.view','Finance','View refunds','Read refund cases',false),
('refund.review','Finance','Review refunds','Review refund basis',false),
('refund.execute','Finance','Execute refund','Execute authorized refund',false),
('reconciliation.view','Finance','View reconciliation','Read reconciliation state',false),
('report.view','Finance','View reports','Read finance reports',false),
('users.access.view','Users & Access','View access','Read admin users/roles/functions',false),
('users.access.manage','Users & Access','Manage access','Manage roles/functions assignments',false),
('audit.view','Audit','View audit','Read immutable audit trail',false),
('system.view','System','View system','Read system state',false),
('system.config.manage','System','Manage system config','Manage approved non-secret config',false),
('system.rules.manage','System','Manage rule versions','Manage future rule versions',false),
('system.payment.verify','System-only','Verify payment','Trusted backend/provider only',true),
('system.supply_price.calculate','System-only','Calculate Supply Price','System only',true),
('system.margin.validate','System-only','Validate margin','System only',true),
('system.invoice.number','System-only','Generate invoice number','Backend only',true),
('system.grace.count','System-only','Count Grace','System only',true),
('system.auto_resume','System-only','Auto Resume','System only',true),
('system.pause.calculate','System-only','Calculate pause','System only',true),
('system.topup.calculate','System-only','Calculate top-up','System only',true),
('system.credit.generate','System-only','Generate Kredit Pasokan','System only',true),
('system.nfc.clean_activate','System-only','Activate clean NFC','System only',true),
('system.h3.enforce','System-only','Enforce H-3','System only',true),
('system.notification.dispatch','System-only','Dispatch notification','Background system only',true)
on conflict(function_key) do update set domain=excluded.domain,label=excluded.label,description=excluded.description,system_only=excluded.system_only;

insert into public.aya_admin_roles(role_code,role_name,description,is_system)
values('super-admin','Super Admin','Full assignable AYA Admin functions; system-only truth remains backend-owned.',true)
on conflict(role_code) do update set role_name=excluded.role_name,description=excluded.description,is_system=true,updated_at=now();

insert into public.aya_admin_users(user_id,display_name,is_active)
select a.user_id,coalesce(a.display_name,'AYA Super Admin'),true
from public.admin_users a join auth.users u on u.id=a.user_id
where a.is_active=true and a.role::text='super_admin'
on conflict(user_id) do update set is_active=true,updated_at=now();

insert into public.aya_admin_role_functions(role_id,function_key)
select r.id,f.function_key from public.aya_admin_roles r cross join public.aya_admin_functions f
where r.role_code='super-admin' and f.system_only=false on conflict do nothing;
insert into public.aya_admin_user_roles(user_id,role_id)
select u.user_id,r.id from public.aya_admin_users u cross join public.aya_admin_roles r
where r.role_code='super-admin' on conflict do nothing;

create or replace function private.aya_admin_is_active()
returns boolean language sql stable security definer set search_path=pg_catalog,public,private
as $$ select exists(select 1 from public.aya_admin_users where user_id=(select auth.uid()) and is_active=true) $$;
create or replace function private.aya_admin_has_function(p_function_key text)
returns boolean language sql stable security definer set search_path=pg_catalog,public,private
as $$ select exists(select 1 from public.aya_admin_users au join public.aya_admin_user_roles ur on ur.user_id=au.user_id join public.aya_admin_role_functions rf on rf.role_id=ur.role_id join public.aya_admin_functions f on f.function_key=rf.function_key where au.user_id=(select auth.uid()) and au.is_active=true and f.system_only=false and f.function_key=p_function_key) $$;
revoke all on function private.aya_admin_is_active() from public;
revoke all on function private.aya_admin_has_function(text) from public;
grant usage on schema private to authenticated;
grant execute on function private.aya_admin_is_active(),private.aya_admin_has_function(text) to authenticated;

create or replace function private.aya_admin_block_system_only_assignment()
returns trigger language plpgsql security invoker set search_path=pg_catalog,public,private as $$
begin
  if exists(select 1 from public.aya_admin_functions where function_key=new.function_key and system_only=true) then
    raise exception 'System-only function tidak dapat di-assign ke Role manusia.';
  end if;
  return new;
end $$;
drop trigger if exists trg_aya_admin_block_system_only_assignment on public.aya_admin_role_functions;
create trigger trg_aya_admin_block_system_only_assignment before insert or update on public.aya_admin_role_functions for each row execute function private.aya_admin_block_system_only_assignment();

alter table public.aya_admin_users enable row level security;
alter table public.aya_admin_functions enable row level security;
alter table public.aya_admin_roles enable row level security;
alter table public.aya_admin_role_functions enable row level security;
alter table public.aya_admin_user_roles enable row level security;
alter table public.aya_admin_audit_log enable row level security;
alter table public.aya_cms_slots enable row level security;
alter table public.aya_cms_versions enable row level security;
alter table public.aya_media_assets enable row level security;
alter table public.aya_testimonial_publish_assets enable row level security;

grant select,insert,update on public.aya_admin_users to authenticated;
grant select on public.aya_admin_functions to authenticated;
grant select,insert,update,delete on public.aya_admin_roles,public.aya_admin_role_functions,public.aya_admin_user_roles to authenticated;
grant select,insert on public.aya_admin_audit_log to authenticated;
grant select,insert,update on public.aya_cms_slots to authenticated;
grant select,insert on public.aya_cms_versions to authenticated;
grant select,insert,update on public.aya_media_assets,public.aya_testimonial_publish_assets to authenticated;

-- Admin-owned RLS.
drop policy if exists aya_admin_users_select on public.aya_admin_users;
create policy aya_admin_users_select on public.aya_admin_users for select to authenticated using(user_id=(select auth.uid()) or private.aya_admin_has_function('users.access.view'));
drop policy if exists aya_admin_users_manage on public.aya_admin_users;
create policy aya_admin_users_manage on public.aya_admin_users for all to authenticated using(private.aya_admin_has_function('users.access.manage')) with check(private.aya_admin_has_function('users.access.manage'));
drop policy if exists aya_admin_functions_select on public.aya_admin_functions;
create policy aya_admin_functions_select on public.aya_admin_functions for select to authenticated using(private.aya_admin_is_active());
drop policy if exists aya_admin_roles_select on public.aya_admin_roles;
create policy aya_admin_roles_select on public.aya_admin_roles for select to authenticated using(private.aya_admin_is_active());
drop policy if exists aya_admin_roles_manage on public.aya_admin_roles;
create policy aya_admin_roles_manage on public.aya_admin_roles for all to authenticated using(private.aya_admin_has_function('users.access.manage')) with check(private.aya_admin_has_function('users.access.manage'));
drop policy if exists aya_admin_role_functions_select on public.aya_admin_role_functions;
create policy aya_admin_role_functions_select on public.aya_admin_role_functions for select to authenticated using(private.aya_admin_is_active());
drop policy if exists aya_admin_role_functions_manage on public.aya_admin_role_functions;
create policy aya_admin_role_functions_manage on public.aya_admin_role_functions for all to authenticated using(private.aya_admin_has_function('users.access.manage')) with check(private.aya_admin_has_function('users.access.manage'));
drop policy if exists aya_admin_user_roles_select on public.aya_admin_user_roles;
create policy aya_admin_user_roles_select on public.aya_admin_user_roles for select to authenticated using(user_id=(select auth.uid()) or private.aya_admin_has_function('users.access.view'));
drop policy if exists aya_admin_user_roles_manage on public.aya_admin_user_roles;
create policy aya_admin_user_roles_manage on public.aya_admin_user_roles for all to authenticated using(private.aya_admin_has_function('users.access.manage')) with check(private.aya_admin_has_function('users.access.manage'));
drop policy if exists aya_admin_audit_select on public.aya_admin_audit_log;
create policy aya_admin_audit_select on public.aya_admin_audit_log for select to authenticated using(private.aya_admin_has_function('audit.view'));
drop policy if exists aya_admin_audit_insert on public.aya_admin_audit_log;
create policy aya_admin_audit_insert on public.aya_admin_audit_log for insert to authenticated with check(actor_user_id=(select auth.uid()) and private.aya_admin_is_active());
drop policy if exists aya_cms_slots_select on public.aya_cms_slots;
create policy aya_cms_slots_select on public.aya_cms_slots for select to authenticated using(private.aya_admin_has_function('website.view'));
drop policy if exists aya_cms_slots_insert on public.aya_cms_slots;
create policy aya_cms_slots_insert on public.aya_cms_slots for insert to authenticated with check(private.aya_admin_has_function('website.edit'));
drop policy if exists aya_cms_slots_update on public.aya_cms_slots;
create policy aya_cms_slots_update on public.aya_cms_slots for update to authenticated using(private.aya_admin_has_function('website.edit') or private.aya_admin_has_function('website.publish') or private.aya_admin_has_function('website.rollback')) with check(private.aya_admin_has_function('website.edit') or private.aya_admin_has_function('website.publish') or private.aya_admin_has_function('website.rollback'));
drop policy if exists aya_cms_versions_select on public.aya_cms_versions;
create policy aya_cms_versions_select on public.aya_cms_versions for select to authenticated using(private.aya_admin_has_function('website.view'));
drop policy if exists aya_cms_versions_insert on public.aya_cms_versions;
create policy aya_cms_versions_insert on public.aya_cms_versions for insert to authenticated with check(private.aya_admin_has_function('website.edit') or private.aya_admin_has_function('website.publish') or private.aya_admin_has_function('website.rollback'));
drop policy if exists aya_media_assets_select on public.aya_media_assets;
create policy aya_media_assets_select on public.aya_media_assets for select to authenticated using(private.aya_admin_has_function('media.view'));
drop policy if exists aya_media_assets_insert on public.aya_media_assets;
create policy aya_media_assets_insert on public.aya_media_assets for insert to authenticated with check(private.aya_admin_has_function('media.upload'));
drop policy if exists aya_media_assets_update on public.aya_media_assets;
create policy aya_media_assets_update on public.aya_media_assets for update to authenticated using(private.aya_admin_has_function('media.edit') or private.aya_admin_has_function('media.archive')) with check(private.aya_admin_has_function('media.edit') or private.aya_admin_has_function('media.archive'));
drop policy if exists aya_testimonial_publish_assets_select on public.aya_testimonial_publish_assets;
create policy aya_testimonial_publish_assets_select on public.aya_testimonial_publish_assets for select to authenticated using(private.aya_admin_has_function('testimonial.view'));
drop policy if exists aya_testimonial_publish_assets_insert on public.aya_testimonial_publish_assets;
create policy aya_testimonial_publish_assets_insert on public.aya_testimonial_publish_assets for insert to authenticated with check(private.aya_admin_has_function('testimonial.publish_asset.upload') or private.aya_admin_has_function('testimonial.render.generate') or private.aya_admin_has_function('testimonial.overlay.edit'));
drop policy if exists aya_testimonial_publish_assets_update on public.aya_testimonial_publish_assets;
create policy aya_testimonial_publish_assets_update on public.aya_testimonial_publish_assets for update to authenticated using(private.aya_admin_has_function('testimonial.overlay.edit') or private.aya_admin_has_function('testimonial.publish_asset.upload') or private.aya_admin_has_function('testimonial.render.generate') or private.aya_admin_has_function('testimonial.publish')) with check(private.aya_admin_has_function('testimonial.overlay.edit') or private.aya_admin_has_function('testimonial.publish_asset.upload') or private.aya_admin_has_function('testimonial.render.generate') or private.aya_admin_has_function('testimonial.publish'));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('aya-admin-media','aya-admin-media',false,41943040,array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm']::text[])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists aya_admin_media_read on storage.objects;
create policy aya_admin_media_read on storage.objects for select to authenticated using(bucket_id='aya-admin-media' and private.aya_admin_has_function('media.view'));
drop policy if exists aya_admin_media_insert on storage.objects;
create policy aya_admin_media_insert on storage.objects for insert to authenticated with check(bucket_id='aya-admin-media' and private.aya_admin_has_function('media.upload'));
drop policy if exists aya_admin_media_update on storage.objects;
create policy aya_admin_media_update on storage.objects for update to authenticated using(bucket_id='aya-admin-media' and private.aya_admin_has_function('media.edit')) with check(bucket_id='aya-admin-media' and private.aya_admin_has_function('media.edit'));

insert into public.aya_cms_slots(slot_key,area,label,draft_content) values
('home.about.intro','Homepage','Tentang AYA — intro',jsonb_build_object('text','')),
('information.ordering','Information','Ordering',jsonb_build_object('text','')),
('information.shipping','Information','Shipping',jsonb_build_object('text','')),
('information.payment','Information','Payment',jsonb_build_object('text','')),
('information.faq','Information','FAQ',jsonb_build_object('text',''))
on conflict(slot_key) do nothing;

-- Atomic Admin action RPCs are intentionally SECURITY INVOKER: RLS stays authoritative.
create or replace function public.aya_admin_save_cms_draft(p_slot_key text,p_content jsonb,p_reason text default null)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private as $$
declare v public.aya_cms_slots%rowtype; n integer;
begin
  if(select auth.uid())is null or not private.aya_admin_has_function('website.edit')then raise exception 'Akses ditolak.';end if;
  select * into v from public.aya_cms_slots where slot_key=p_slot_key for update;if not found then raise exception 'Content slot tidak ditemukan.';end if;
  n:=v.draft_version+1;update public.aya_cms_slots set draft_content=coalesce(p_content,'{}'::jsonb),draft_version=n,updated_by=(select auth.uid()),updated_at=now() where slot_key=p_slot_key;
  insert into public.aya_cms_versions(slot_key,version,content,version_status,created_by,reason)values(p_slot_key,n,coalesce(p_content,'{}'::jsonb),'draft',(select auth.uid()),nullif(btrim(coalesce(p_reason,'')),''));
  insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,before_data,after_data,reason)values((select auth.uid()),'website.edit','cms_slot',p_slot_key,'save_draft',v.draft_content,coalesce(p_content,'{}'::jsonb),p_reason);
  return jsonb_build_object('slotKey',p_slot_key,'draftVersion',n);
end$$;
create or replace function public.aya_admin_publish_cms_slot(p_slot_key text,p_reason text default null)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private as $$
declare v public.aya_cms_slots%rowtype;
begin
  if(select auth.uid())is null or not private.aya_admin_has_function('website.publish')then raise exception 'Akses ditolak.';end if;
  select * into v from public.aya_cms_slots where slot_key=p_slot_key for update;if not found then raise exception 'Content slot tidak ditemukan.';end if;
  update public.aya_cms_slots set published_content=v.draft_content,published_version=v.draft_version,published_at=now(),updated_by=(select auth.uid()),updated_at=now() where slot_key=p_slot_key;
  insert into public.aya_cms_versions(slot_key,version,content,version_status,created_by,reason)values(p_slot_key,v.draft_version,v.draft_content,'published',(select auth.uid()),nullif(btrim(coalesce(p_reason,'')),'')) on conflict do nothing;
  insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,before_data,after_data,reason)values((select auth.uid()),'website.publish','cms_slot',p_slot_key,'publish',v.published_content,v.draft_content,p_reason);
  return jsonb_build_object('slotKey',p_slot_key,'publishedVersion',v.draft_version);
end$$;
create or replace function public.aya_admin_rollback_cms_slot(p_slot_key text,p_version integer,p_reason text default null)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private as $$
declare v public.aya_cms_slots%rowtype;s public.aya_cms_versions%rowtype;n integer;
begin
  if(select auth.uid())is null or not private.aya_admin_has_function('website.rollback')then raise exception 'Akses ditolak.';end if;
  select * into v from public.aya_cms_slots where slot_key=p_slot_key for update;select * into s from public.aya_cms_versions where slot_key=p_slot_key and version=p_version order by created_at desc limit 1;if not found then raise exception 'Versi sumber tidak ditemukan.';end if;
  n:=greatest(v.draft_version,coalesce(v.published_version,0))+1;update public.aya_cms_slots set draft_content=s.content,published_content=s.content,draft_version=n,published_version=n,published_at=now(),updated_by=(select auth.uid()),updated_at=now() where slot_key=p_slot_key;
  insert into public.aya_cms_versions(slot_key,version,content,version_status,created_by,reason)values(p_slot_key,n,s.content,'rollback_source',(select auth.uid()),coalesce(nullif(btrim(coalesce(p_reason,'')),''),'Rollback from version '||p_version));
  insert into public.aya_cms_versions(slot_key,version,content,version_status,created_by,reason)values(p_slot_key,n,s.content,'published',(select auth.uid()),coalesce(nullif(btrim(coalesce(p_reason,'')),''),'Rollback publish')) on conflict do nothing;
  insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,before_data,after_data,reason,reference)values((select auth.uid()),'website.rollback','cms_slot',p_slot_key,'rollback',v.published_content,s.content,p_reason,'version:'||p_version);
  return jsonb_build_object('slotKey',p_slot_key,'publishedVersion',n,'sourceVersion',p_version);
end$$;

create or replace function public.aya_admin_moderate_testimonial(p_id uuid,p_decision text,p_approved_text text default null,p_public_name text default null,p_public_city text default null,p_rejection_note text default null)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private as $$
declare v public.aya_testimonials%rowtype;
begin
  if(select auth.uid())is null or not private.aya_admin_has_function('testimonial.moderate')then raise exception 'Akses ditolak.';end if;if p_decision not in('approved','rejected')then raise exception 'Keputusan tidak valid.';end if;
  select * into v from public.aya_testimonials where id=p_id for update;if not found then raise exception 'Testimoni tidak ditemukan.';end if;
  update public.aya_testimonials set status=p_decision,approved_text=case when p_decision='approved' then coalesce(nullif(btrim(p_approved_text),''),v.testimonial_text) else approved_text end,public_display_name=case when p_decision='approved' then coalesce(nullif(btrim(p_public_name),''),v.display_name) else public_display_name end,public_city=case when p_decision='approved' then coalesce(nullif(btrim(p_public_city),''),v.city) else public_city end,rejection_note=case when p_decision='rejected' then nullif(btrim(coalesce(p_rejection_note,'')),'') else null end,approved_at=case when p_decision='approved' then now() else null end,updated_at=now() where id=p_id;
  insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,before_data,after_data,reason)values((select auth.uid()),'testimonial.moderate','testimonial',p_id::text,'moderate',to_jsonb(v),jsonb_build_object('status',p_decision),case when p_decision='rejected' then p_rejection_note else null end);
  return jsonb_build_object('id',p_id,'status',p_decision);
end$$;
create or replace function public.aya_admin_set_testimonial_publication(p_id uuid,p_publish boolean,p_display_order integer default null,p_public_media_url text default null)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private as $$
declare v public.aya_testimonials%rowtype;
begin
  if(select auth.uid())is null or not private.aya_admin_has_function('testimonial.publish')then raise exception 'Akses ditolak.';end if;select * into v from public.aya_testimonials where id=p_id for update;if not found then raise exception 'Testimoni tidak ditemukan.';end if;if p_publish and v.status<>'approved' then raise exception 'Hanya testimoni approved yang dapat dipublikasikan.';end if;
  update public.aya_testimonials set is_featured=p_publish,display_order=coalesce(p_display_order,display_order),public_media_url=coalesce(nullif(btrim(coalesce(p_public_media_url,'')),''),public_media_url),updated_at=now() where id=p_id;
  insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,before_data,after_data)values((select auth.uid()),'testimonial.publish','testimonial',p_id::text,case when p_publish then 'publish' else 'unpublish' end,to_jsonb(v),jsonb_build_object('is_featured',p_publish));return jsonb_build_object('id',p_id,'published',p_publish);
end$$;

create or replace function public.aya_admin_update_product(p_product_id text,p_public_status text,p_orderable boolean,p_visible boolean,p_supply_eligible boolean default null)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private as $$
declare v jsonb;b jsonb;
begin
  if(select auth.uid())is null or not private.aya_admin_has_function('product.edit')then raise exception 'Akses ditolak.';end if;select to_jsonb(x)into v from public.aya_catalog_products x where product_id=p_product_id;if v is null then raise exception 'Produk tidak ditemukan.';end if;
  update public.aya_catalog_products set public_status=p_public_status,orderable=p_orderable,visible=p_visible,updated_at=now() where product_id=p_product_id;
  if p_supply_eligible is not null then if not private.aya_admin_has_function('product.b2b.manage')then raise exception 'Akses B2B Product Master ditolak.';end if;select to_jsonb(x)into b from public.aya_b2b_product_config x where product_id=p_product_id;update public.aya_b2b_product_config set supply_eligible=p_supply_eligible,updated_at=now() where product_id=p_product_id;insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,before_data,after_data)values((select auth.uid()),'product.b2b.manage','b2b_product_config',p_product_id,'update_supply_eligibility',b,jsonb_build_object('supply_eligible',p_supply_eligible));end if;
  insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,before_data,after_data)values((select auth.uid()),'product.edit','catalog_product',p_product_id,'update',v,jsonb_build_object('public_status',p_public_status,'orderable',p_orderable,'visible',p_visible));return jsonb_build_object('productId',p_product_id,'updated',true);
end$$;
create or replace function public.aya_admin_update_b2b_measurement(p_measurement_id uuid,p_base_cost bigint,p_final_unit_price bigint)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private as $$
declare v jsonb;e record;
begin
  if(select auth.uid())is null or(not private.aya_admin_has_function('b2b.cogs.edit')and not private.aya_admin_has_function('b2b.unit_price.edit'))then raise exception 'Akses ditolak.';end if;select to_jsonb(m)into v from public.aya_b2b_measurements m where id=p_measurement_id;if v is null then raise exception 'Measurement tidak ditemukan.';end if;
  update public.aya_b2b_measurements set base_cost=case when private.aya_admin_has_function('b2b.cogs.edit')then p_base_cost else base_cost end,final_unit_price=case when private.aya_admin_has_function('b2b.unit_price.edit')then p_final_unit_price else final_unit_price end,updated_at=now() where id=p_measurement_id;select * into e from public.aya_b2b_measurement_economics_v1(p_measurement_id);if coalesce((v->>'commercial_enabled')::boolean,false)and not coalesce(e.margin_valid,false)then update public.aya_b2b_measurements set commercial_enabled=false,updated_at=now() where id=p_measurement_id;end if;
  insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,before_data,after_data)select(select auth.uid()),case when private.aya_admin_has_function('b2b.cogs.edit')then'b2b.cogs.edit'else'b2b.unit_price.edit'end,'b2b_measurement',p_measurement_id::text,'update_economics',v,to_jsonb(m)from public.aya_b2b_measurements m where id=p_measurement_id;return jsonb_build_object('measurementId',p_measurement_id,'marginValid',coalesce(e.margin_valid,false),'commercialReady',coalesce(e.commercial_ready,false));
end$$;

create or replace function public.aya_admin_create_role(p_role_code text,p_role_name text,p_description text,p_function_keys text[])
returns uuid language plpgsql security invoker set search_path=pg_catalog,public,private as $$
declare r uuid;k text;
begin
  if(select auth.uid())is null or not private.aya_admin_has_function('users.access.manage')then raise exception 'Akses ditolak.';end if;if p_role_code!~'^[a-z0-9][a-z0-9-]{1,63}$'then raise exception 'Role code tidak valid.';end if;if exists(select 1 from public.aya_admin_functions where function_key=any(coalesce(p_function_keys,'{}'::text[]))and system_only=true)then raise exception 'System-only function tidak dapat di-assign.';end if;
  insert into public.aya_admin_roles(role_code,role_name,description,is_system)values(p_role_code,btrim(p_role_name),nullif(btrim(coalesce(p_description,'')),''),false)returning id into r;foreach k in array coalesce(p_function_keys,'{}'::text[])loop insert into public.aya_admin_role_functions(role_id,function_key)values(r,k);end loop;insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,after_data)values((select auth.uid()),'users.access.manage','admin_role',r::text,'create',jsonb_build_object('role_code',p_role_code,'role_name',p_role_name,'function_keys',p_function_keys));return r;
end$$;
create or replace function public.aya_admin_set_role_functions(p_role_id uuid,p_function_keys text[])
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private as $$
declare b jsonb;
begin
  if(select auth.uid())is null or not private.aya_admin_has_function('users.access.manage')then raise exception 'Akses ditolak.';end if;if exists(select 1 from public.aya_admin_roles where id=p_role_id and is_system=true)then raise exception 'System role tidak dapat diubah dari UI.';end if;if exists(select 1 from public.aya_admin_functions where function_key=any(coalesce(p_function_keys,'{}'::text[]))and system_only=true)then raise exception 'System-only function tidak dapat di-assign.';end if;
  select coalesce(jsonb_agg(function_key),'[]'::jsonb)into b from public.aya_admin_role_functions where role_id=p_role_id;delete from public.aya_admin_role_functions where role_id=p_role_id;insert into public.aya_admin_role_functions(role_id,function_key)select p_role_id,unnest(coalesce(p_function_keys,'{}'::text[]));insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,before_data,after_data)values((select auth.uid()),'users.access.manage','admin_role',p_role_id::text,'set_functions',b,to_jsonb(coalesce(p_function_keys,'{}'::text[])));return jsonb_build_object('roleId',p_role_id,'updated',true);
end$$;
create or replace function public.aya_admin_assign_role(p_user_id uuid,p_role_id uuid,p_assign boolean)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private as $$
begin
  if(select auth.uid())is null or not private.aya_admin_has_function('users.access.manage')then raise exception 'Akses ditolak.';end if;if not exists(select 1 from public.aya_admin_users where user_id=p_user_id and is_active=true)then raise exception 'Admin User tidak ditemukan/aktif.';end if;if p_assign then insert into public.aya_admin_user_roles(user_id,role_id)values(p_user_id,p_role_id)on conflict do nothing;else delete from public.aya_admin_user_roles where user_id=p_user_id and role_id=p_role_id;end if;if not exists(select 1 from public.aya_admin_user_roles where user_id=p_user_id)then raise exception 'Admin User harus memiliki setidaknya satu Role.';end if;insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,after_data)values((select auth.uid()),'users.access.manage','admin_user',p_user_id::text,case when p_assign then'assign_role'else'remove_role'end,jsonb_build_object('role_id',p_role_id));return jsonb_build_object('userId',p_user_id,'roleId',p_role_id,'assigned',p_assign);
end$$;

create or replace function public.aya_admin_upsert_product_master(p_product_id text,p_product_name text,p_line_name text,p_category_name text,p_active boolean)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private as $$
declare v_before jsonb;v_exists boolean;
begin
 if(select auth.uid())is null or not private.aya_admin_has_function('product.edit')then raise exception 'Akses ditolak.';end if;if p_product_id !~ '^[a-z0-9][a-z0-9-]{1,79}$' then raise exception 'Product ID tidak valid.';end if;select exists(select 1 from public.aya_product_master where product_id=p_product_id) into v_exists;select to_jsonb(x) into v_before from public.aya_product_master x where product_id=p_product_id;insert into public.aya_product_master(product_id,product_name,line_name,category_name,active)values(p_product_id,btrim(p_product_name),btrim(p_line_name),btrim(p_category_name),p_active)on conflict(product_id) do update set product_name=excluded.product_name,line_name=excluded.line_name,category_name=excluded.category_name,active=excluded.active,updated_at=now();insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,before_data,after_data)select(select auth.uid()),'product.edit','product_master',p_product_id,case when v_exists then 'update' else 'create' end,v_before,to_jsonb(x) from public.aya_product_master x where product_id=p_product_id;return jsonb_build_object('productId',p_product_id,'created',not v_exists);
end$$;
create or replace function public.aya_admin_upsert_product_variant(p_product_id text,p_variant_name text,p_active boolean)
returns jsonb language plpgsql security invoker set search_path=pg_catalog,public,private as $$
declare v_before jsonb;v_exists boolean;
begin
 if(select auth.uid())is null or not private.aya_admin_has_function('product.variant.edit')then raise exception 'Akses ditolak.';end if;if not exists(select 1 from public.aya_product_master where product_id=p_product_id)then raise exception 'Product Master tidak ditemukan.';end if;if char_length(btrim(p_variant_name))<1 then raise exception 'Variant wajib diisi.';end if;select exists(select 1 from public.aya_product_variants where product_id=p_product_id and variant_name=btrim(p_variant_name)) into v_exists;select to_jsonb(x) into v_before from public.aya_product_variants x where product_id=p_product_id and variant_name=btrim(p_variant_name);insert into public.aya_product_variants(product_id,variant_name,active)values(p_product_id,btrim(p_variant_name),p_active)on conflict(product_id,variant_name) do update set active=excluded.active,updated_at=now();insert into public.aya_admin_audit_log(actor_user_id,effective_function,entity_type,entity_id,action,before_data,after_data)select(select auth.uid()),'product.variant.edit','product_variant',p_product_id||':'||btrim(p_variant_name),case when v_exists then 'update' else 'create' end,v_before,to_jsonb(x) from public.aya_product_variants x where product_id=p_product_id and variant_name=btrim(p_variant_name);return jsonb_build_object('productId',p_product_id,'variantName',btrim(p_variant_name),'created',not v_exists);
end$$;

revoke all on function public.aya_admin_save_cms_draft(text,jsonb,text),public.aya_admin_publish_cms_slot(text,text),public.aya_admin_rollback_cms_slot(text,integer,text),public.aya_admin_moderate_testimonial(uuid,text,text,text,text,text),public.aya_admin_set_testimonial_publication(uuid,boolean,integer,text),public.aya_admin_update_product(text,text,boolean,boolean,boolean),public.aya_admin_update_b2b_measurement(uuid,bigint,bigint),public.aya_admin_create_role(text,text,text,text[]),public.aya_admin_set_role_functions(uuid,text[]),public.aya_admin_assign_role(uuid,uuid,boolean),public.aya_admin_upsert_product_master(text,text,text,text,boolean),public.aya_admin_upsert_product_variant(text,text,boolean) from public,anon;
grant execute on function public.aya_admin_save_cms_draft(text,jsonb,text),public.aya_admin_publish_cms_slot(text,text),public.aya_admin_rollback_cms_slot(text,integer,text),public.aya_admin_moderate_testimonial(uuid,text,text,text,text,text),public.aya_admin_set_testimonial_publication(uuid,boolean,integer,text),public.aya_admin_update_product(text,text,boolean,boolean,boolean),public.aya_admin_update_b2b_measurement(uuid,bigint,bigint),public.aya_admin_create_role(text,text,text,text[]),public.aya_admin_set_role_functions(uuid,text[]),public.aya_admin_assign_role(uuid,uuid,boolean),public.aya_admin_upsert_product_master(text,text,text,text,boolean),public.aya_admin_upsert_product_variant(text,text,boolean) to authenticated;
