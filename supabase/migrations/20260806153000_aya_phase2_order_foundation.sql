-- ============================================================
-- AYA RAOS — PHASE 2 ORDER & RECURRING BUSINESS INQUIRY FOUNDATION
-- Additive, idempotent migration for the staging Supabase project.
-- Payment, shipping quotation, inventory, quotation automation,
-- customer accounts, and public order tracking remain inactive.
-- ============================================================

create extension if not exists pgcrypto;

create sequence if not exists public.aya_order_number_seq start 1;
create sequence if not exists public.aya_business_inquiry_number_seq start 1;

create table if not exists public.aya_catalog_products (
  product_id text primary key,
  product_name text not null,
  line_name text not null,
  category_name text not null,
  public_status text not null,
  visible boolean not null default true,
  orderable boolean not null default false,
  min_quantity integer not null default 1,
  max_quantity integer,
  quantity_step integer not null default 1,
  supply_eligible boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint aya_catalog_product_id_check check (product_id ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  constraint aya_catalog_status_check check (public_status in ('Tersedia','Pre-order','Habis')),
  constraint aya_catalog_quantity_check check (min_quantity >= 1 and quantity_step >= 1 and (max_quantity is null or max_quantity >= min_quantity))
);

create table if not exists public.aya_catalog_variants (
  product_id text not null references public.aya_catalog_products(product_id) on delete cascade,
  variant_name text not null,
  unit_price bigint not null,
  orderable boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (product_id, variant_name),
  constraint aya_variant_name_check check (char_length(variant_name) between 1 and 120),
  constraint aya_variant_price_check check (unit_price >= 0)
);

insert into public.aya_catalog_products (product_id, product_name, line_name, category_name, public_status, visible, orderable, min_quantity, max_quantity, quantity_step, supply_eligible)
values
  ('sambal-bawang','Sambal Bawang','AYA Spice Haven','Sambal','Tersedia',true,true,1,null,1,true),
  ('bawang-goreng-sumenep','Bawang Goreng Sumenep','AYA Spice Haven','Pendamping','Tersedia',true,true,1,null,1,false),
  ('rendang-daging-sapi','Rendang Daging Sapi','AYA Spice Haven','Lauk Berbumbu','Pre-order',true,true,3,null,1,false),
  ('ayam-goreng-kuning','Ayam Goreng Kuning','AYA Spice Haven','Lauk Berbumbu','Pre-order',true,true,1,null,1,false),
  ('dimsum-chili-oil','Dimsum + Chili Oil','AYA Snack & Drinks','Frozen Snack','Pre-order',true,true,1,null,1,false),
  ('kacang-tanah-jumbo','Kacang Tanah Jumbo','AYA Snack & Drinks','Camilan','Tersedia',true,true,1,null,1,false),
  ('kacang-mede-jumbo','Kacang Mede Jumbo','AYA Snack & Drinks','Camilan','Tersedia',true,true,1,null,1,false),
  ('es-buah','Es Buah AYA','AYA Snack & Drinks','Minuman','Pre-order',true,true,1,null,1,false),
  ('beras-pilihan','Beras Pilihan','AYA Farm','Beras','Habis',true,false,1,null,1,true),
  ('cireng','Cireng','AYA Snack & Drinks','Frozen Snack','Habis',true,false,1,null,1,false)
on conflict (product_id) do update set
  product_name = excluded.product_name,
  line_name = excluded.line_name,
  category_name = excluded.category_name,
  public_status = excluded.public_status,
  visible = excluded.visible,
  orderable = excluded.orderable,
  min_quantity = excluded.min_quantity,
  max_quantity = excluded.max_quantity,
  quantity_step = excluded.quantity_step,
  supply_eligible = excluded.supply_eligible,
  updated_at = now();

insert into public.aya_catalog_variants (product_id, variant_name, unit_price, orderable)
values
  ('sambal-bawang','Original',40000,true),
  ('sambal-bawang','Cumi/Pete',50000,true),
  ('sambal-bawang','Jengkol',55000,true),
  ('sambal-bawang','Teri Nasi',60000,true),
  ('bawang-goreng-sumenep','Pouch',60000,true),
  ('bawang-goreng-sumenep','Toples',70000,true),
  ('rendang-daging-sapi','300 g',105000,true),
  ('ayam-goreng-kuning','Paket 4 pcs',50000,true),
  ('ayam-goreng-kuning','Satuan 1 pcs',15000,true),
  ('ayam-goreng-kuning','Kulit 500 g',30000,true),
  ('ayam-goreng-kuning','Ceker 500 g',30000,true),
  ('dimsum-chili-oil','10 pcs + chili oil',40000,true),
  ('kacang-tanah-jumbo','Toples',45000,true),
  ('kacang-tanah-jumbo','Pouch',50000,true),
  ('kacang-mede-jumbo','250 g',80000,true),
  ('es-buah','250 ml',15000,true)
on conflict (product_id, variant_name) do update set
  unit_price = excluded.unit_price,
  orderable = excluded.orderable,
  updated_at = now();

create table if not exists public.aya_orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  idempotency_key uuid not null,
  environment text not null default 'staging',
  context text not null,
  customer_name text not null,
  whatsapp text not null,
  email text,
  event_type text,
  event_date date,
  guest_estimate integer,
  event_name text,
  shipping_area text not null,
  shipping_address text not null,
  requested_delivery_date date,
  notes text,
  subtotal_amount bigint not null,
  shipping_amount bigint,
  total_amount bigint,
  order_status text not null default 'received',
  payment_status text not null default 'not_started',
  source text not null default 'website',
  payload_version integer not null default 1,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (environment, idempotency_key),
  constraint aya_orders_environment_check check (environment in ('staging','production')),
  constraint aya_orders_context_check check (context in ('personal','event')),
  constraint aya_orders_status_check check (order_status in ('received','reviewing','confirmed','cancelled','archived')),
  constraint aya_orders_payment_status_check check (payment_status in ('not_started','pending','paid','failed','expired','refunded')),
  constraint aya_orders_amount_check check (subtotal_amount >= 0 and (shipping_amount is null or shipping_amount >= 0) and (total_amount is null or total_amount >= subtotal_amount)),
  constraint aya_orders_guest_check check (guest_estimate is null or guest_estimate between 1 and 100000)
);

create table if not exists public.aya_order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.aya_orders(id) on delete cascade,
  line_number integer not null,
  product_id text not null,
  product_name_snapshot text not null,
  variant_name_snapshot text not null,
  unit_price_snapshot bigint not null,
  quantity integer not null,
  item_subtotal bigint not null,
  unique (order_id, line_number),
  constraint aya_order_items_quantity_check check (quantity >= 1),
  constraint aya_order_items_amount_check check (unit_price_snapshot >= 0 and item_subtotal = unit_price_snapshot * quantity)
);

create table if not exists public.aya_order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.aya_orders(id) on delete cascade,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists aya_orders_status_idx on public.aya_orders(environment, order_status, submitted_at desc);
create index if not exists aya_orders_whatsapp_idx on public.aya_orders(environment, whatsapp, submitted_at desc);
create index if not exists aya_order_events_order_idx on public.aya_order_events(order_id, created_at);

create table if not exists public.aya_business_inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_number text not null unique,
  idempotency_key uuid not null,
  environment text not null default 'staging',
  company_name text not null,
  business_type text not null,
  pic_name text not null,
  pic_role text not null,
  whatsapp text not null,
  email text not null,
  intended_use text not null,
  volume_per_delivery text not null,
  frequency text not null,
  supply_location text not null,
  proposed_start_date date not null,
  operational_needs text,
  administrative_needs text,
  notes text,
  consent boolean not null,
  inquiry_status text not null default 'received',
  source text not null default 'website',
  payload_version integer not null default 1,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (environment, idempotency_key),
  constraint aya_business_environment_check check (environment in ('staging','production')),
  constraint aya_business_frequency_check check (frequency in ('weekly','biweekly','monthly','seasonal','other-recurring')),
  constraint aya_business_status_check check (inquiry_status in ('received','reviewing','qualified','not_available','closed','archived')),
  constraint aya_business_consent_check check (consent is true)
);

create table if not exists public.aya_business_inquiry_items (
  id bigint generated always as identity primary key,
  inquiry_id uuid not null references public.aya_business_inquiries(id) on delete cascade,
  product_id text,
  product_name_snapshot text not null,
  specification text,
  created_at timestamptz not null default now()
);

create table if not exists public.aya_business_inquiry_events (
  id bigint generated always as identity primary key,
  inquiry_id uuid not null references public.aya_business_inquiries(id) on delete cascade,
  event_type text not null,
  event_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists aya_business_status_idx on public.aya_business_inquiries(environment, inquiry_status, submitted_at desc);
create index if not exists aya_business_whatsapp_idx on public.aya_business_inquiries(environment, whatsapp, submitted_at desc);
create index if not exists aya_business_events_idx on public.aya_business_inquiry_events(inquiry_id, created_at);

alter table public.aya_catalog_products enable row level security;
alter table public.aya_catalog_variants enable row level security;
alter table public.aya_orders enable row level security;
alter table public.aya_order_items enable row level security;
alter table public.aya_order_events enable row level security;
alter table public.aya_business_inquiries enable row level security;
alter table public.aya_business_inquiry_items enable row level security;
alter table public.aya_business_inquiry_events enable row level security;

revoke all on table public.aya_catalog_products, public.aya_catalog_variants, public.aya_orders, public.aya_order_items, public.aya_order_events, public.aya_business_inquiries, public.aya_business_inquiry_items, public.aya_business_inquiry_events from public, anon, authenticated;

grant select, insert, update, delete on table public.aya_catalog_products, public.aya_catalog_variants, public.aya_orders, public.aya_order_items, public.aya_order_events, public.aya_business_inquiries, public.aya_business_inquiry_items, public.aya_business_inquiry_events to service_role;
grant usage, select on sequence public.aya_order_number_seq, public.aya_business_inquiry_number_seq to service_role;

create or replace function public.create_aya_order_v1(
  p_payload jsonb,
  p_idempotency_key text,
  p_environment text default 'staging',
  p_website text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_environment text := case when lower(btrim(coalesce(p_environment,'staging'))) = 'production' then 'production' else 'staging' end;
  v_key uuid;
  v_context text := lower(btrim(coalesce(p_payload->>'context','')));
  v_customer jsonb := coalesce(p_payload->'customer','{}'::jsonb);
  v_shipping jsonb := coalesce(p_payload->'shipping','{}'::jsonb);
  v_items jsonb := coalesce(p_payload->'items','[]'::jsonb);
  v_name text;
  v_whatsapp text;
  v_order_id uuid;
  v_order_number text;
  v_subtotal bigint := 0;
  v_line integer := 0;
  v_item jsonb;
  v_product public.aya_catalog_products%rowtype;
  v_variant public.aya_catalog_variants%rowtype;
  v_quantity integer;
  v_existing public.aya_orders%rowtype;
  v_seq bigint;
begin
  if nullif(btrim(coalesce(p_website,'')),'') is not null then raise exception 'Permintaan tidak valid.'; end if;
  begin v_key := p_idempotency_key::uuid; exception when others then raise exception 'Idempotency key tidak valid.'; end;

  select * into v_existing from public.aya_orders where environment = v_environment and idempotency_key = v_key limit 1;
  if found then
    return jsonb_build_object('orderId',v_existing.id,'orderNumber',v_existing.order_number,'subtotalAmount',v_existing.subtotal_amount,'status',v_existing.order_status,'environment',v_existing.environment,'duplicate',true,'submittedAt',v_existing.submitted_at);
  end if;

  if v_context not in ('personal','event') then raise exception 'Konteks pesanan tidak valid.'; end if;
  if jsonb_typeof(v_items) <> 'array' or jsonb_array_length(v_items) < 1 or jsonb_array_length(v_items) > 30 then raise exception 'Item pesanan tidak valid.'; end if;

  if v_context = 'personal' then
    v_name := regexp_replace(btrim(coalesce(v_customer->>'customerName','')), '\s+', ' ', 'g');
    v_whatsapp := regexp_replace(btrim(coalesce(v_customer->>'whatsapp','')), '[^0-9+]', '', 'g');
  else
    v_name := regexp_replace(btrim(coalesce(v_customer->>'eventPic','')), '\s+', ' ', 'g');
    v_whatsapp := regexp_replace(btrim(coalesce(v_customer->>'eventWhatsapp','')), '[^0-9+]', '', 'g');
    if nullif(btrim(coalesce(v_customer->>'eventType','')),'') is null then raise exception 'Jenis acara atau kebutuhan wajib diisi.'; end if;
    if (v_customer->>'eventDate') is null then raise exception 'Tanggal acara atau kebutuhan wajib diisi.'; end if;
  end if;
  if char_length(v_name) not between 2 and 120 then raise exception 'Nama atau PIC tidak valid.'; end if;
  if char_length(v_whatsapp) not between 7 and 24 then raise exception 'Nomor WhatsApp tidak valid.'; end if;
  if char_length(btrim(coalesce(v_shipping->>'area',''))) not between 2 and 120 then raise exception 'Area pengiriman tidak valid.'; end if;
  if char_length(btrim(coalesce(v_shipping->>'address',''))) not between 5 and 600 then raise exception 'Alamat pengiriman tidak valid.'; end if;

  if (select count(*) from public.aya_orders where environment = v_environment and submitted_at >= now() - interval '1 minute') >= 60 then raise exception 'Layanan sedang sibuk. Silakan coba kembali.'; end if;
  if (select count(*) from public.aya_orders where environment = v_environment and whatsapp = v_whatsapp and submitted_at >= now() - interval '24 hours') >= 8 then raise exception 'Batas penyimpanan order untuk nomor ini telah tercapai.'; end if;

  for v_item in select value from jsonb_array_elements(v_items)
  loop
    v_line := v_line + 1;
    select * into v_product from public.aya_catalog_products where product_id = lower(btrim(coalesce(v_item->>'productId',''))) and visible and orderable;
    if not found then raise exception 'Produk pada baris % tidak tersedia.', v_line; end if;
    select * into v_variant from public.aya_catalog_variants where product_id = v_product.product_id and variant_name = btrim(coalesce(v_item->>'variantName','')) and orderable;
    if not found then raise exception 'Varian pada baris % tidak tersedia.', v_line; end if;
    begin v_quantity := (v_item->>'quantity')::integer; exception when others then raise exception 'Jumlah pada baris % tidak valid.', v_line; end;
    if v_quantity < v_product.min_quantity or (v_product.max_quantity is not null and v_quantity > v_product.max_quantity) or mod(v_quantity - v_product.min_quantity, v_product.quantity_step) <> 0 then raise exception 'Jumlah % untuk % tidak sesuai aturan.', v_quantity, v_product.product_name; end if;
    v_subtotal := v_subtotal + (v_variant.unit_price * v_quantity);
  end loop;

  v_seq := nextval('public.aya_order_number_seq');
  v_order_number := case when v_environment = 'production' then 'AYA-ORD-' else 'AYA-STG-ORD-' end || to_char(current_date,'YYYYMMDD') || '-' || lpad(v_seq::text,6,'0');

  insert into public.aya_orders (
    order_number,idempotency_key,environment,context,customer_name,whatsapp,email,event_type,event_date,guest_estimate,event_name,
    shipping_area,shipping_address,requested_delivery_date,notes,subtotal_amount,shipping_amount,total_amount,order_status,payment_status,payload_version
  ) values (
    v_order_number,v_key,v_environment,v_context,v_name,v_whatsapp,nullif(lower(btrim(coalesce(v_customer->>'email',''))),''),
    case when v_context='event' then nullif(btrim(coalesce(v_customer->>'eventType','')),'') end,
    case when v_context='event' and nullif(v_customer->>'eventDate','') is not null then (v_customer->>'eventDate')::date end,
    case when v_context='event' and nullif(v_customer->>'guestEstimate','') is not null then (v_customer->>'guestEstimate')::integer end,
    case when v_context='event' then nullif(btrim(coalesce(v_customer->>'eventName','')),'') end,
    btrim(v_shipping->>'area'),btrim(v_shipping->>'address'),
    case when nullif(v_shipping->>'deliveryDate','') is not null then (v_shipping->>'deliveryDate')::date end,
    nullif(btrim(coalesce(p_payload->>'notes','')),''),v_subtotal,null,null,'received','not_started',1
  ) returning id into v_order_id;

  v_line := 0;
  for v_item in select value from jsonb_array_elements(v_items)
  loop
    v_line := v_line + 1;
    select * into v_product from public.aya_catalog_products where product_id = lower(btrim(v_item->>'productId'));
    select * into v_variant from public.aya_catalog_variants where product_id = v_product.product_id and variant_name = btrim(v_item->>'variantName');
    v_quantity := (v_item->>'quantity')::integer;
    insert into public.aya_order_items(order_id,line_number,product_id,product_name_snapshot,variant_name_snapshot,unit_price_snapshot,quantity,item_subtotal)
    values(v_order_id,v_line,v_product.product_id,v_product.product_name,v_variant.variant_name,v_variant.unit_price,v_quantity,v_variant.unit_price*v_quantity);
  end loop;

  insert into public.aya_order_events(order_id,event_type,event_data) values(v_order_id,'order_received',jsonb_build_object('source','website','context',v_context,'subtotalAmount',v_subtotal));

  return jsonb_build_object('orderId',v_order_id,'orderNumber',v_order_number,'subtotalAmount',v_subtotal,'status','received','environment',v_environment,'duplicate',false,'submittedAt',now());
end;
$$;

create or replace function public.create_aya_business_inquiry_v1(
  p_payload jsonb,
  p_idempotency_key text,
  p_environment text default 'staging',
  p_website text default null
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog, public, extensions
as $$
declare
  v_environment text := case when lower(btrim(coalesce(p_environment,'staging'))) = 'production' then 'production' else 'staging' end;
  v_key uuid;
  v_frequency text := lower(btrim(coalesce(p_payload->>'frequency','')));
  v_product_id text := lower(btrim(coalesce(p_payload->>'product','')));
  v_product_name text;
  v_inquiry_id uuid;
  v_inquiry_number text;
  v_existing public.aya_business_inquiries%rowtype;
  v_seq bigint;
  v_whatsapp text := regexp_replace(btrim(coalesce(p_payload->>'whatsapp','')), '[^0-9+]', '', 'g');
begin
  if nullif(btrim(coalesce(p_website,'')),'') is not null then raise exception 'Permintaan tidak valid.'; end if;
  begin v_key := p_idempotency_key::uuid; exception when others then raise exception 'Idempotency key tidak valid.'; end;

  select * into v_existing from public.aya_business_inquiries where environment = v_environment and idempotency_key = v_key limit 1;
  if found then
    return jsonb_build_object('inquiryId',v_existing.id,'inquiryNumber',v_existing.inquiry_number,'status',v_existing.inquiry_status,'environment',v_existing.environment,'duplicate',true,'submittedAt',v_existing.submitted_at);
  end if;

  if v_frequency not in ('weekly','biweekly','monthly','seasonal','other-recurring') then raise exception 'Frekuensi harus menunjukkan pasokan berulang.'; end if;
  if coalesce((p_payload->>'consent')::boolean,false) is not true then raise exception 'Pernyataan pemahaman wajib disetujui.'; end if;
  if char_length(btrim(coalesce(p_payload->>'company',''))) not between 2 and 160 then raise exception 'Nama usaha tidak valid.'; end if;
  if char_length(btrim(coalesce(p_payload->>'pic',''))) not between 2 and 120 then raise exception 'Nama PIC tidak valid.'; end if;
  if char_length(btrim(coalesce(p_payload->>'role',''))) not between 2 and 120 then raise exception 'Peran PIC tidak valid.'; end if;
  if char_length(v_whatsapp) not between 7 and 24 then raise exception 'Nomor WhatsApp tidak valid.'; end if;
  if lower(btrim(coalesce(p_payload->>'email',''))) !~ '^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$' then raise exception 'Email tidak valid.'; end if;
  if char_length(btrim(coalesce(p_payload->>'volume',''))) not between 2 and 160 then raise exception 'Estimasi volume tidak valid.'; end if;
  if char_length(btrim(coalesce(p_payload->>'location',''))) not between 2 and 240 then raise exception 'Lokasi pasokan tidak valid.'; end if;
  if nullif(p_payload->>'startDate','') is null then raise exception 'Rencana mulai wajib diisi.'; end if;

  if v_product_id = 'other' then v_product_name := 'Produk lain — perlu evaluasi';
  else
    select product_name into v_product_name from public.aya_catalog_products where product_id = v_product_id and supply_eligible;
    if not found then raise exception 'Produk belum tersedia untuk jalur pasokan berkala.'; end if;
  end if;

  if (select count(*) from public.aya_business_inquiries where environment=v_environment and submitted_at >= now()-interval '1 minute') >= 30 then raise exception 'Layanan sedang sibuk. Silakan coba kembali.'; end if;
  if (select count(*) from public.aya_business_inquiries where environment=v_environment and whatsapp=v_whatsapp and submitted_at >= now()-interval '24 hours') >= 3 then raise exception 'Batas pengajuan untuk nomor ini telah tercapai.'; end if;

  v_seq := nextval('public.aya_business_inquiry_number_seq');
  v_inquiry_number := case when v_environment='production' then 'AYA-BIZ-' else 'AYA-STG-BIZ-' end || to_char(current_date,'YYYYMMDD') || '-' || lpad(v_seq::text,6,'0');

  insert into public.aya_business_inquiries(
    inquiry_number,idempotency_key,environment,company_name,business_type,pic_name,pic_role,whatsapp,email,intended_use,
    volume_per_delivery,frequency,supply_location,proposed_start_date,operational_needs,administrative_needs,notes,consent,inquiry_status,payload_version
  ) values (
    v_inquiry_number,v_key,v_environment,btrim(p_payload->>'company'),btrim(p_payload->>'businessType'),btrim(p_payload->>'pic'),btrim(p_payload->>'role'),
    v_whatsapp,lower(btrim(p_payload->>'email')),btrim(p_payload->>'intendedUse'),btrim(p_payload->>'volume'),v_frequency,btrim(p_payload->>'location'),
    (p_payload->>'startDate')::date,nullif(btrim(coalesce(p_payload->>'operationalNeeds','')),''),nullif(btrim(coalesce(p_payload->>'administrativeNeeds','')),''),
    nullif(btrim(coalesce(p_payload->>'notes','')),''),true,'received',1
  ) returning id into v_inquiry_id;

  insert into public.aya_business_inquiry_items(inquiry_id,product_id,product_name_snapshot,specification)
  values(v_inquiry_id,case when v_product_id='other' then null else v_product_id end,v_product_name,nullif(btrim(coalesce(p_payload->>'operationalNeeds','')),''));
  insert into public.aya_business_inquiry_events(inquiry_id,event_type,event_data)
  values(v_inquiry_id,'inquiry_received',jsonb_build_object('source','website','frequency',v_frequency,'productId',v_product_id));

  return jsonb_build_object('inquiryId',v_inquiry_id,'inquiryNumber',v_inquiry_number,'status','received','environment',v_environment,'duplicate',false,'submittedAt',now());
end;
$$;

revoke all on function public.create_aya_order_v1(jsonb,text,text,text) from public;
revoke all on function public.create_aya_business_inquiry_v1(jsonb,text,text,text) from public;
grant execute on function public.create_aya_order_v1(jsonb,text,text,text) to anon, authenticated, service_role;
grant execute on function public.create_aya_business_inquiry_v1(jsonb,text,text,text) to anon, authenticated, service_role;

create or replace view public.aya_order_operational_view as
select o.order_number,o.environment,o.context,o.customer_name,o.whatsapp,o.shipping_area,o.subtotal_amount,o.shipping_amount,o.total_amount,o.order_status,o.payment_status,o.submitted_at,count(i.id) as item_count
from public.aya_orders o join public.aya_order_items i on i.order_id=o.id
group by o.id;

create or replace view public.aya_business_inquiry_operational_view as
select b.inquiry_number,b.environment,b.company_name,b.business_type,b.pic_name,b.whatsapp,b.frequency,b.supply_location,b.inquiry_status,b.submitted_at,i.product_name_snapshot
from public.aya_business_inquiries b join public.aya_business_inquiry_items i on i.inquiry_id=b.id;

revoke all on table public.aya_order_operational_view, public.aya_business_inquiry_operational_view from public, anon, authenticated;
grant select on table public.aya_order_operational_view, public.aya_business_inquiry_operational_view to service_role;
