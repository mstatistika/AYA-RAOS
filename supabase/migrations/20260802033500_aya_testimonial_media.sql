-- ============================================================
-- AYA RAOS — TESTIMONIAL MEDIA UPLOAD
-- Apply after 20260801152000_aya_testimonials.sql.
-- This migration is additive and idempotent.
-- ============================================================

create extension if not exists pgcrypto;

alter table public.aya_testimonials
  add column if not exists phone text,
  add column if not exists media_source text,
  add column if not exists media_path text,
  add column if not exists media_mime text,
  add column if not exists media_size bigint;

alter table public.aya_testimonials
  alter column email drop not null;

update public.aya_testimonials
set media_source = 'external_url'
where media_url is not null
  and media_source is null;

alter table public.aya_testimonials
  drop constraint if exists aya_testimonials_phone_length_check,
  drop constraint if exists aya_testimonials_media_source_check,
  drop constraint if exists aya_testimonials_media_path_check,
  drop constraint if exists aya_testimonials_media_mime_check,
  drop constraint if exists aya_testimonials_media_size_check,
  drop constraint if exists aya_testimonials_media_consistency_check;

alter table public.aya_testimonials
  add constraint aya_testimonials_phone_length_check
    check (phone is null or char_length(phone) between 7 and 24),
  add constraint aya_testimonials_media_source_check
    check (media_source is null or media_source in ('upload', 'external_url')),
  add constraint aya_testimonials_media_path_check
    check (media_path is null or char_length(media_path) <= 500),
  add constraint aya_testimonials_media_mime_check
    check (
      media_mime is null
      or media_mime in (
        'image/jpeg', 'image/png', 'image/webp',
        'video/mp4', 'video/quicktime', 'video/webm'
      )
    ),
  add constraint aya_testimonials_media_size_check
    check (media_size is null or media_size between 1 and 41943040),
  add constraint aya_testimonials_media_consistency_check
    check (
      (testimonial_format = 'text'
        and media_source is null
        and media_url is null
        and media_path is null
        and media_mime is null
        and media_size is null)
      or
      (testimonial_format in ('photo', 'video')
        and (
          (media_source = 'external_url'
            and media_url is not null
            and media_path is null
            and media_mime is null
            and media_size is null)
          or
          (media_source = 'upload'
            and media_url is null
            and media_path is not null
            and media_mime is not null
            and media_size is not null)
        ))
    );

create index if not exists aya_testimonials_phone_submitted_idx
on public.aya_testimonials (phone, submitted_at desc)
where phone is not null;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'aya-testimonial-media',
  'aya-testimonial-media',
  false,
  41943040,
  array[
    'image/jpeg', 'image/png', 'image/webp',
    'video/mp4', 'video/quicktime', 'video/webm'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table storage.objects enable row level security;

drop policy if exists "aya_testimonial_media_insert" on storage.objects;
create policy "aya_testimonial_media_insert"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'aya-testimonial-media'
  and name ~ '^(staging|production)/[0-9]{4}/[0-9]{2}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|mp4|mov|webm)$'
);

-- No public SELECT policy is created. Moderators access private files
-- through the Supabase dashboard or service-role tooling.

do $$
declare
  item record;
begin
  for item in
    select p.oid::regprocedure as signature
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'submit_aya_testimonial'
  loop
    execute format('drop function if exists %s', item.signature);
  end loop;
end;
$$;

create function public.submit_aya_testimonial(
  p_display_name text,
  p_city text,
  p_phone text,
  p_email text,
  p_product_id text,
  p_product_name text,
  p_testimonial_text text,
  p_testimonial_format text,
  p_media_source text,
  p_media_url text,
  p_media_path text,
  p_media_mime text,
  p_media_size bigint,
  p_consent_to_publish boolean,
  p_environment text default 'staging',
  p_website text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_id uuid;
  v_name text := regexp_replace(btrim(coalesce(p_display_name, '')), '\s+', ' ', 'g');
  v_city text := nullif(regexp_replace(btrim(coalesce(p_city, '')), '\s+', ' ', 'g'), '');
  v_phone text := nullif(regexp_replace(btrim(coalesce(p_phone, '')), '[^0-9+]', '', 'g'), '');
  v_email text := nullif(lower(btrim(coalesce(p_email, ''))), '');
  v_product_id text := lower(btrim(coalesce(p_product_id, '')));
  v_product_name text := regexp_replace(btrim(coalesce(p_product_name, '')), '\s+', ' ', 'g');
  v_text text := btrim(coalesce(p_testimonial_text, ''));
  v_format text := lower(btrim(coalesce(p_testimonial_format, 'text')));
  v_media_source text := nullif(lower(btrim(coalesce(p_media_source, ''))), '');
  v_media_url text := nullif(btrim(coalesce(p_media_url, '')), '');
  v_media_path text := nullif(btrim(coalesce(p_media_path, '')), '');
  v_media_mime text := nullif(lower(btrim(coalesce(p_media_mime, ''))), '');
  v_media_size bigint := p_media_size;
  v_environment text := case when lower(btrim(coalesce(p_environment, 'staging'))) = 'production' then 'production' else 'staging' end;
  v_hash text;
begin
  if nullif(btrim(coalesce(p_website, '')), '') is not null then
    return gen_random_uuid();
  end if;

  if char_length(v_name) not between 2 and 80 then raise exception 'Nama tidak valid.'; end if;
  if v_city is not null and char_length(v_city) > 80 then raise exception 'Nama kota terlalu panjang.'; end if;
  if v_phone is not null and char_length(v_phone) not between 7 and 24 then raise exception 'Nomor WhatsApp tidak valid.'; end if;
  if v_email is not null and (char_length(v_email) > 180 or v_email !~* '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$') then raise exception 'Email tidak valid.'; end if;
  if v_product_id !~ '^[a-z0-9][a-z0-9-]{1,79}$' then raise exception 'Produk tidak valid.'; end if;
  if char_length(v_product_name) not between 2 and 120 then raise exception 'Nama produk tidak valid.'; end if;
  if char_length(v_text) not between 15 and 800 then raise exception 'Testimoni harus berisi 15 sampai 800 karakter.'; end if;
  if v_format not in ('text', 'photo', 'video') then raise exception 'Format testimoni tidak valid.'; end if;
  if p_consent_to_publish is not true then raise exception 'Persetujuan publikasi wajib diberikan.'; end if;

  if v_format = 'text' then
    v_media_source := null;
    v_media_url := null;
    v_media_path := null;
    v_media_mime := null;
    v_media_size := null;
  elsif v_media_source = 'external_url' then
    if v_media_url is null or char_length(v_media_url) > 600 or v_media_url !~* '^https://' then
      raise exception 'Link media HTTPS wajib diisi.';
    end if;
    v_media_path := null;
    v_media_mime := null;
    v_media_size := null;
  elsif v_media_source = 'upload' then
    if v_media_path is null
      or v_media_path !~ ('^' || v_environment || '/[0-9]{4}/[0-9]{2}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|mp4|mov|webm)$')
    then raise exception 'Path media tidak valid.'; end if;
    if v_media_size is null or v_media_size < 1 or v_media_size > 41943040 then raise exception 'Ukuran media tidak valid.'; end if;
    if v_format = 'photo' and (v_media_mime not in ('image/jpeg', 'image/png', 'image/webp') or v_media_size > 8388608) then
      raise exception 'Foto harus JPG, PNG, atau WebP dan maksimal 8 MB.';
    end if;
    if v_format = 'video' and v_media_mime not in ('video/mp4', 'video/quicktime', 'video/webm') then
      raise exception 'Video harus MP4, MOV, atau WebM.';
    end if;
    v_media_url := null;
  else
    raise exception 'Pilih upload media atau link eksternal.';
  end if;

  if (select count(*) from public.aya_testimonials where submitted_at >= now() - interval '1 minute') >= 30 then
    raise exception 'Layanan sedang sibuk. Silakan coba kembali.';
  end if;
  if v_phone is not null and (select count(*) from public.aya_testimonials where phone = v_phone and submitted_at >= now() - interval '24 hours') >= 3 then
    raise exception 'Batas pengiriman untuk nomor ini telah tercapai.';
  end if;
  if v_email is not null and (select count(*) from public.aya_testimonials where lower(email) = v_email and submitted_at >= now() - interval '24 hours') >= 3 then
    raise exception 'Batas pengiriman untuk email ini telah tercapai.';
  end if;

  v_hash := encode(digest(convert_to(coalesce(v_phone, v_email, lower(v_name)) || '|' || v_product_id || '|' || lower(regexp_replace(v_text, '\s+', ' ', 'g')), 'UTF8'), 'sha256'), 'hex');

  select id into v_id
  from public.aya_testimonials
  where submission_hash = v_hash
    and submitted_at >= now() - interval '7 days'
  order by submitted_at desc
  limit 1;
  if v_id is not null then return v_id; end if;

  insert into public.aya_testimonials (
    display_name, city, phone, email,
    product_id, product_name_snapshot,
    testimonial_text, testimonial_format,
    media_source, media_url, media_path, media_mime, media_size,
    consent_to_publish, status, environment, submission_hash
  ) values (
    v_name, v_city, v_phone, v_email,
    v_product_id, v_product_name,
    v_text, v_format,
    v_media_source, v_media_url, v_media_path, v_media_mime, v_media_size,
    true, 'pending', v_environment, v_hash
  ) returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_aya_testimonial(
  text, text, text, text, text, text, text, text,
  text, text, text, text, bigint, boolean, text, text
) from public;

grant execute on function public.submit_aya_testimonial(
  text, text, text, text, text, text, text, text,
  text, text, text, text, bigint, boolean, text, text
) to anon, authenticated, service_role;
