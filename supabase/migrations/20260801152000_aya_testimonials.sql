-- ============================================================
-- AYA RAOS — MODERATED PRODUCT TESTIMONIALS
-- Run once in Supabase SQL Editor.
--
-- Public visitors:
-- - cannot read or write the table directly;
-- - can submit through submit_aya_testimonial();
-- - can read approved fields through
--   get_approved_aya_testimonials().
--
-- Media upload is not enabled in the browser yet.
-- The private bucket is created as future infrastructure.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.aya_testimonials (
  id uuid primary key default gen_random_uuid(),

  display_name text not null,
  city text,
  email text not null,

  product_id text not null,
  product_name_snapshot text not null,

  testimonial_text text not null,
  testimonial_format text not null default 'text',
  media_url text,

  consent_to_publish boolean not null default false,

  status text not null default 'pending',

  approved_text text,
  public_display_name text,
  public_city text,
  public_media_url text,

  is_featured boolean not null default false,
  display_order integer not null default 100,

  environment text not null default 'staging',

  rejection_note text,
  submission_hash text not null,

  submitted_at timestamptz not null default now(),
  approved_at timestamptz,
  updated_at timestamptz not null default now(),

  constraint aya_testimonials_status_check
    check (
      status in (
        'pending',
        'approved',
        'rejected',
        'archived'
      )
    ),

  constraint aya_testimonials_format_check
    check (
      testimonial_format in (
        'text',
        'photo',
        'video'
      )
    ),

  constraint aya_testimonials_environment_check
    check (
      environment in (
        'staging',
        'production'
      )
    ),

  constraint aya_testimonials_name_length_check
    check (
      char_length(display_name)
      between 2 and 80
    ),

  constraint aya_testimonials_city_length_check
    check (
      city is null
      or char_length(city) <= 80
    ),

  constraint aya_testimonials_email_length_check
    check (
      char_length(email)
      between 5 and 180
    ),

  constraint aya_testimonials_product_id_check
    check (
      product_id ~ '^[a-z0-9][a-z0-9-]{1,79}$'
    ),

  constraint aya_testimonials_product_name_check
    check (
      char_length(product_name_snapshot)
      between 2 and 120
    ),

  constraint aya_testimonials_text_length_check
    check (
      char_length(testimonial_text)
      between 15 and 800
    ),

  constraint aya_testimonials_approved_text_check
    check (
      approved_text is null
      or char_length(approved_text)
      between 10 and 800
    ),

  constraint aya_testimonials_media_url_check
    check (
      media_url is null
      or (
        char_length(media_url) <= 600
        and media_url ~* '^https://'
      )
    ),

  constraint aya_testimonials_public_media_url_check
    check (
      public_media_url is null
      or (
        char_length(public_media_url) <= 600
        and public_media_url ~* '^https://'
      )
    )
);

create index if not exists
  aya_testimonials_status_display_idx
on public.aya_testimonials (
  environment,
  status,
  is_featured desc,
  display_order,
  approved_at desc
);

create index if not exists
  aya_testimonials_email_submitted_idx
on public.aya_testimonials (
  lower(email),
  submitted_at desc
);

create index if not exists
  aya_testimonials_hash_submitted_idx
on public.aya_testimonials (
  submission_hash,
  submitted_at desc
);

alter table public.aya_testimonials
  enable row level security;

revoke all
on table public.aya_testimonials
from public, anon, authenticated;


-- ============================================================
-- MODERATION TRIGGER
-- ============================================================

create or replace function
public.set_aya_testimonial_moderation_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();

  if (
    nullif(
      btrim(
        coalesce(
          new.public_display_name,
          ''
        )
      ),
      ''
    ) is null
  ) then
    new.public_display_name :=
      btrim(new.display_name);
  end if;

  if (
    nullif(
      btrim(
        coalesce(
          new.public_city,
          ''
        )
      ),
      ''
    ) is null
  ) then
    new.public_city :=
      nullif(
        btrim(
          coalesce(new.city, '')
        ),
        ''
      );
  end if;

  if new.status = 'approved' then
    if (
      nullif(
        btrim(
          coalesce(
            new.approved_text,
            ''
          )
        ),
        ''
      ) is null
    ) then
      new.approved_text :=
        btrim(new.testimonial_text);
    end if;

    if new.approved_at is null then
      new.approved_at := now();
    end if;
  end if;

  return new;
end;
$$;

revoke all
on function
public.set_aya_testimonial_moderation_fields()
from public, anon, authenticated;

drop trigger if exists
  set_aya_testimonial_moderation_fields_trigger
on public.aya_testimonials;

create trigger
  set_aya_testimonial_moderation_fields_trigger
before insert or update
on public.aya_testimonials
for each row
execute function
public.set_aya_testimonial_moderation_fields();


-- ============================================================
-- PUBLIC SUBMISSION RPC
-- ============================================================

drop function if exists
public.submit_aya_testimonial(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  text,
  text
);

create function
public.submit_aya_testimonial(
  p_display_name text,
  p_city text,
  p_email text,
  p_product_id text,
  p_product_name text,
  p_testimonial_text text,
  p_testimonial_format text,
  p_media_url text,
  p_consent_to_publish boolean,
  p_environment text default 'staging',
  p_website text default null
)
returns uuid
language plpgsql
security definer
set search_path = pg_catalog, extensions
as $$
declare
  v_id uuid;

  v_name text :=
    regexp_replace(
      btrim(
        coalesce(
          p_display_name,
          ''
        )
      ),
      '\s+',
      ' ',
      'g'
    );

  v_city text :=
    nullif(
      regexp_replace(
        btrim(
          coalesce(
            p_city,
            ''
          )
        ),
        '\s+',
        ' ',
        'g'
      ),
      ''
    );

  v_email text :=
    lower(
      btrim(
        coalesce(
          p_email,
          ''
        )
      )
    );

  v_product_id text :=
    lower(
      btrim(
        coalesce(
          p_product_id,
          ''
        )
      )
    );

  v_product_name text :=
    regexp_replace(
      btrim(
        coalesce(
          p_product_name,
          ''
        )
      ),
      '\s+',
      ' ',
      'g'
    );

  v_text text :=
    btrim(
      coalesce(
        p_testimonial_text,
        ''
      )
    );

  v_format text :=
    lower(
      btrim(
        coalesce(
          p_testimonial_format,
          'text'
        )
      )
    );

  v_media_url text :=
    nullif(
      btrim(
        coalesce(
          p_media_url,
          ''
        )
      ),
      ''
    );

  v_environment text :=
    lower(
      btrim(
        coalesce(
          p_environment,
          'staging'
        )
      )
    );

  v_hash text;
begin
  /*
    Honeypot: respond successfully to bots,
    but do not store their submission.
  */
  if (
    nullif(
      btrim(
        coalesce(
          p_website,
          ''
        )
      ),
      ''
    ) is not null
  ) then
    return gen_random_uuid();
  end if;

  if char_length(v_name)
    not between 2 and 80
  then
    raise exception
      'Nama tidak valid.';
  end if;

  if (
    v_city is not null
    and char_length(v_city) > 80
  ) then
    raise exception
      'Nama kota terlalu panjang.';
  end if;

  if (
    char_length(v_email)
    not between 5 and 180
    or v_email !~*
      '^[A-Z0-9._%+\-]+@[A-Z0-9.\-]+\.[A-Z]{2,}$'
  ) then
    raise exception
      'Email tidak valid.';
  end if;

  if (
    v_product_id
      !~ '^[a-z0-9][a-z0-9-]{1,79}$'
  ) then
    raise exception
      'Produk tidak valid.';
  end if;

  if char_length(v_product_name)
    not between 2 and 120
  then
    raise exception
      'Nama produk tidak valid.';
  end if;

  if char_length(v_text)
    not between 15 and 800
  then
    raise exception
      'Testimoni harus berisi 15 sampai 800 karakter.';
  end if;

  if v_format not in (
    'text',
    'photo',
    'video'
  ) then
    raise exception
      'Format testimoni tidak valid.';
  end if;

  if v_environment not in (
    'staging',
    'production'
  ) then
    raise exception
      'Environment tidak valid.';
  end if;

  if (
    v_format = 'text'
  ) then
    v_media_url := null;
  elsif (
    v_media_url is null
    or char_length(v_media_url) > 600
    or v_media_url !~* '^https://'
  ) then
    raise exception
      'Link media HTTPS wajib diisi.';
  end if;

  if p_consent_to_publish
    is not true
  then
    raise exception
      'Persetujuan publikasi wajib diberikan.';
  end if;

  /*
    Coarse global protection:
    maximum 30 submissions per minute.
  */
  if (
    select count(*)
    from public.aya_testimonials t
    where t.submitted_at
      >= now() - interval '1 minute'
  ) >= 30 then
    raise exception
      'Layanan sedang sibuk. Silakan coba kembali.';
  end if;

  /*
    Maximum 3 submissions per email
    within 24 hours.
  */
  if (
    select count(*)
    from public.aya_testimonials t
    where lower(t.email) = v_email
      and t.submitted_at
        >= now() - interval '24 hours'
  ) >= 3 then
    raise exception
      'Batas pengiriman telah tercapai.';
  end if;

  v_hash :=
    encode(
      digest(
        v_email
        || '|'
        || v_product_id
        || '|'
        || lower(
          regexp_replace(
            v_text,
            '\s+',
            ' ',
            'g'
          )
        ),
        'sha256'
      ),
      'hex'
    );

  select t.id
  into v_id
  from public.aya_testimonials t
  where t.submission_hash = v_hash
    and t.submitted_at
      >= now() - interval '7 days'
  order by t.submitted_at desc
  limit 1;

  if v_id is not null then
    return v_id;
  end if;

  insert into public.aya_testimonials (
    display_name,
    city,
    email,
    product_id,
    product_name_snapshot,
    testimonial_text,
    testimonial_format,
    media_url,
    consent_to_publish,
    status,
    environment,
    submission_hash
  )
  values (
    v_name,
    v_city,
    v_email,
    v_product_id,
    v_product_name,
    v_text,
    v_format,
    v_media_url,
    true,
    'pending',
    v_environment,
    v_hash
  )
  returning id
  into v_id;

  return v_id;
end;
$$;

revoke all
on function
public.submit_aya_testimonial(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  text,
  text
)
from public;

grant execute
on function
public.submit_aya_testimonial(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  text,
  text
)
to anon, authenticated, service_role;


-- ============================================================
-- APPROVED PUBLIC READ RPC
-- ============================================================

drop function if exists
public.get_approved_aya_testimonials(
  text
);

create function
public.get_approved_aya_testimonials(
  p_environment text default 'staging'
)
returns table (
  id uuid,
  display_name text,
  city text,
  product_id text,
  product_name text,
  public_text text,
  testimonial_format text,
  public_media_url text,
  is_featured boolean,
  approved_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    t.id,

    coalesce(
      nullif(
        btrim(
          t.public_display_name
        ),
        ''
      ),
      'Pelanggan AYA'
    ) as display_name,

    nullif(
      btrim(
        t.public_city
      ),
      ''
    ) as city,

    t.product_id,

    t.product_name_snapshot
      as product_name,

    btrim(
      t.approved_text
    ) as public_text,

    t.testimonial_format,

    nullif(
      btrim(
        t.public_media_url
      ),
      ''
    ) as public_media_url,

    t.is_featured,

    t.approved_at

  from public.aya_testimonials t

  where t.status = 'approved'
    and t.consent_to_publish = true
    and t.environment = (
      case
        when lower(
          btrim(
            coalesce(
              p_environment,
              'staging'
            )
          )
        ) = 'production'
        then 'production'
        else 'staging'
      end
    )
    and nullif(
      btrim(
        coalesce(
          t.approved_text,
          ''
        )
      ),
      ''
    ) is not null

  order by
    t.is_featured desc,
    t.display_order asc,
    t.approved_at desc

  limit 24;
$$;

revoke all
on function
public.get_approved_aya_testimonials(text)
from public;

grant execute
on function
public.get_approved_aya_testimonials(text)
to anon, authenticated, service_role;


-- ============================================================
-- PRIVATE STORAGE FOUNDATION
-- No anonymous upload policy is created yet.
-- ============================================================

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
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm'
  ]
)
on conflict (id)
do update set
  public = excluded.public,
  file_size_limit =
    excluded.file_size_limit,
  allowed_mime_types =
    excluded.allowed_mime_types;


-- ============================================================
-- VERIFICATION
-- ============================================================

-- select *
-- from public.get_approved_aya_testimonials(
--   'staging'
-- );

-- Moderation workflow:
-- 1. Open Table Editor → aya_testimonials.
-- 2. Filter status = pending.
-- 3. Review testimonial_text, media_url, and consent.
-- 4. Optionally edit:
--      approved_text
--      public_display_name
--      public_city
--      public_media_url
-- 5. Change status to approved.
-- 6. Set is_featured/display_order when needed.
