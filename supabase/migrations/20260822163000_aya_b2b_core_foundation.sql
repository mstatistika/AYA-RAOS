-- ============================================================
-- AYA RAOS — B2B CORE FOUNDATION v1
-- Additive migration. Does not alter historical Phase-2 tables.
-- Implements trusted Product Master B2B commercial readiness and
-- qualification rules without exposing COGS/margin to public clients.
-- ============================================================

create extension if not exists pgcrypto;

create table if not exists public.aya_product_master (
  product_id text primary key,
  product_name text not null,
  line_name text not null,
  category_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aya_product_master_id_check check (product_id ~ '^[a-z0-9][a-z0-9-]{1,79}$'),
  constraint aya_product_master_name_check check (char_length(product_name) between 1 and 160)
);

create table if not exists public.aya_product_variants (
  product_id text not null references public.aya_product_master(product_id) on delete restrict,
  variant_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, variant_name),
  constraint aya_product_variant_name_check check (char_length(variant_name) between 1 and 120)
);

create table if not exists public.aya_b2b_product_config (
  product_id text primary key references public.aya_product_master(product_id) on delete restrict,
  product_class text not null default 'standard',
  supply_eligible boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint aya_b2b_product_class_check check (product_class in ('rice','standard'))
);

create table if not exists public.aya_b2b_measurements (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  variant_name text not null,
  unit_label text not null,
  quantity_in_kg_per_unit numeric(14,4),
  base_cost bigint,
  final_unit_price bigint,
  commercial_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, variant_name, unit_label),
  foreign key (product_id, variant_name) references public.aya_product_variants(product_id, variant_name) on delete restrict,
  constraint aya_b2b_measurement_variant_check check (char_length(variant_name) between 1 and 120),
  constraint aya_b2b_measurement_unit_check check (char_length(unit_label) between 1 and 40),
  constraint aya_b2b_measurement_kg_check check (quantity_in_kg_per_unit is null or quantity_in_kg_per_unit > 0),
  constraint aya_b2b_measurement_base_cost_check check (base_cost is null or base_cost >= 0),
  constraint aya_b2b_measurement_final_price_check check (final_unit_price is null or final_unit_price >= 0)
);

create table if not exists public.aya_b2b_measurement_cost_components (
  id uuid primary key default gen_random_uuid(),
  measurement_id uuid not null references public.aya_b2b_measurements(id) on delete cascade,
  component_code text not null,
  component_label text not null,
  amount bigint not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (measurement_id, component_code),
  constraint aya_b2b_cost_component_code_check check (component_code ~ '^[a-z0-9][a-z0-9_-]{0,63}$'),
  constraint aya_b2b_cost_component_amount_check check (amount >= 0)
);

create table if not exists public.aya_b2b_qualification_thresholds (
  rule_version text not null,
  product_class text not null,
  cadence text not null,
  minimum_quantity_kg numeric(14,4),
  minimum_value bigint,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (rule_version, product_class, cadence),
  constraint aya_b2b_threshold_class_check check (product_class in ('rice','standard')),
  constraint aya_b2b_threshold_cadence_check check (cadence in ('W1','W2','M1','M2')),
  constraint aya_b2b_threshold_shape_check check (
    (product_class = 'rice' and minimum_quantity_kg is not null and minimum_quantity_kg > 0 and minimum_value is null)
    or
    (product_class = 'standard' and minimum_value is not null and minimum_value > 0 and minimum_quantity_kg is null)
  )
);

create table if not exists public.aya_b2b_qualification_settings (
  singleton boolean primary key default true,
  active_rule_version text not null,
  -- Aggregation semantics are intentionally not activated until explicitly resolved.
  -- 'cadence_group' is a technical mode only; seed remains 'pending'.
  evaluation_scope text not null default 'pending',
  value_basis text not null default 'pending',
  qualification_enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint aya_b2b_settings_singleton_check check (singleton is true),
  constraint aya_b2b_settings_scope_check check (evaluation_scope in ('pending','cadence_group')),
  constraint aya_b2b_settings_value_basis_check check (value_basis in ('pending','supply_price'))
);

insert into public.aya_b2b_qualification_thresholds
  (rule_version, product_class, cadence, minimum_quantity_kg, minimum_value, active)
values
  ('2026-08-19-v1','rice','W1',5,null,true),
  ('2026-08-19-v1','rice','W2',10,null,true),
  ('2026-08-19-v1','rice','M1',25,null,true),
  ('2026-08-19-v1','rice','M2',50,null,true),
  ('2026-08-19-v1','standard','W1',null,100000,true),
  ('2026-08-19-v1','standard','W2',null,200000,true),
  ('2026-08-19-v1','standard','M1',null,500000,true),
  ('2026-08-19-v1','standard','M2',null,1000000,true)
on conflict (rule_version, product_class, cadence) do nothing;

insert into public.aya_b2b_qualification_settings
  (singleton, active_rule_version, evaluation_scope, value_basis, qualification_enabled)
values
  (true, '2026-08-19-v1', 'pending', 'pending', false)
on conflict (singleton) do nothing;

-- Seed shared product identity from current canonical public data.
-- Seed B2B eligibility explicitly from the current public AYA_BUSINESS_SUPPLY boundary.
-- No private price or cost is inferred from B2C retail data.
insert into public.aya_product_master
  (product_id, product_name, line_name, category_name, active)
values
  ('sambal-bawang','Sambal Bawang','AYA Spice Haven','Sambal',true),
  ('bawang-goreng-sumenep','Bawang Goreng Sumenep','AYA Spice Haven','Pendamping',true),
  ('rendang-daging-sapi','Rendang Daging Sapi','AYA Spice Haven','Lauk Berbumbu',true),
  ('ayam-goreng-kuning','Ayam Goreng Kuning','AYA Spice Haven','Lauk Berbumbu',true),
  ('dimsum-chili-oil','Dimsum + Chili Oil','AYA Snacks & Drinks','Frozen Snack',true),
  ('kacang-tanah-jumbo','Kacang Tanah Jumbo','AYA Snacks & Drinks','Camilan',true),
  ('kacang-mede-jumbo','Kacang Mede Jumbo','AYA Snacks & Drinks','Camilan',true),
  ('es-buah','Es Buah AYA','AYA Snacks & Drinks','Minuman',true),
  ('beras-pilihan','Beras Pilihan','AYA Farm','Beras',true),
  ('cireng','Cireng','AYA Snacks & Drinks','Frozen Snack',true)
on conflict (product_id) do nothing;

insert into public.aya_product_variants (product_id, variant_name, active)
values
  ('sambal-bawang','Original',true),
  ('sambal-bawang','Cumi/Pete',true),
  ('sambal-bawang','Jengkol',true),
  ('sambal-bawang','Teri Nasi',true),
  ('bawang-goreng-sumenep','Pouch',true),
  ('bawang-goreng-sumenep','Toples',true),
  ('rendang-daging-sapi','300 g',true),
  ('ayam-goreng-kuning','Paket 4 pcs',true),
  ('ayam-goreng-kuning','Satuan 1 pcs',true),
  ('ayam-goreng-kuning','Kulit 500 g',true),
  ('ayam-goreng-kuning','Ceker 500 g',true),
  ('dimsum-chili-oil','10 pcs + chili oil',true),
  ('kacang-tanah-jumbo','Toples',true),
  ('kacang-tanah-jumbo','Pouch',true),
  ('kacang-mede-jumbo','250 g',true),
  ('es-buah','250 ml',true)
on conflict (product_id, variant_name) do nothing;

insert into public.aya_b2b_product_config
  (product_id, product_class, supply_eligible, active)
values
  ('sambal-bawang','standard',true,true),
  ('bawang-goreng-sumenep','standard',true,true),
  ('rendang-daging-sapi','standard',true,true),
  ('ayam-goreng-kuning','standard',true,true),
  ('dimsum-chili-oil','standard',true,true),
  ('kacang-tanah-jumbo','standard',true,true),
  ('kacang-mede-jumbo','standard',true,true),
  ('es-buah','standard',true,true),
  ('beras-pilihan','rice',false,true),
  ('cireng','standard',false,true)
on conflict (product_id) do nothing;

insert into public.aya_b2b_measurements (product_id, variant_name, unit_label, commercial_enabled)
values
  ('sambal-bawang','Original','Botol',false),
  ('sambal-bawang','Cumi/Pete','Botol',false),
  ('sambal-bawang','Jengkol','Botol',false),
  ('sambal-bawang','Teri Nasi','Botol',false),
  ('bawang-goreng-sumenep','Pouch','Pouch',false),
  ('bawang-goreng-sumenep','Toples','Toples',false),
  ('rendang-daging-sapi','300 g','g',false),
  ('ayam-goreng-kuning','Paket 4 pcs','Ekor',false),
  ('ayam-goreng-kuning','Satuan 1 pcs','Pcs',false),
  ('ayam-goreng-kuning','Kulit 500 g','g',false),
  ('ayam-goreng-kuning','Ceker 500 g','g',false),
  ('dimsum-chili-oil','10 pcs + chili oil','Paket',false),
  ('kacang-tanah-jumbo','Toples','Toples',false),
  ('kacang-tanah-jumbo','Pouch','Pouch',false),
  ('kacang-mede-jumbo','250 g','g',false),
  ('es-buah','250 ml','ml',false)
on conflict (product_id, variant_name, unit_label) do nothing;

create or replace function public.aya_b2b_measurement_economics_v1(p_measurement_id uuid)
returns table (
  cogs bigint,
  recommended_unit_price bigint,
  final_unit_price bigint,
  supply_price bigint,
  margin bigint,
  margin_valid boolean,
  commercial_ready boolean
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select
    case when m.base_cost is null then null else m.base_cost + coalesce(c.extra_cost,0) end as cogs,
    case when m.base_cost is null then null else m.base_cost + coalesce(c.extra_cost,0) + 5000 end as recommended_unit_price,
    m.final_unit_price,
    case when m.final_unit_price is null then null else m.final_unit_price - 2000 end as supply_price,
    case when m.base_cost is null or m.final_unit_price is null then null else (m.final_unit_price - 2000) - (m.base_cost + coalesce(c.extra_cost,0)) end as margin,
    case when m.base_cost is null or m.final_unit_price is null then false else (m.final_unit_price - 2000) - (m.base_cost + coalesce(c.extra_cost,0)) > 0 end as margin_valid,
    case when m.commercial_enabled and m.base_cost is not null and m.final_unit_price is not null and (m.final_unit_price - 2000) - (m.base_cost + coalesce(c.extra_cost,0)) > 0 then true else false end as commercial_ready
  from public.aya_b2b_measurements m
  left join (
    select measurement_id, sum(amount)::bigint as extra_cost
    from public.aya_b2b_measurement_cost_components
    where active
    group by measurement_id
  ) c on c.measurement_id = m.id
  where m.id = p_measurement_id;
$$;

create or replace function public.aya_b2b_qualify_v1(p_payload jsonb)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_settings public.aya_b2b_qualification_settings%rowtype;
  v_rows jsonb := coalesce(p_payload->'products','[]'::jsonb);
  v_row jsonb;
  v_product public.aya_product_master%rowtype;
  v_b2b_config public.aya_b2b_product_config%rowtype;
  v_measurement public.aya_b2b_measurements%rowtype;
  v_econ record;
  v_product_id text;
  v_variant text;
  v_unit text;
  v_cadence text;
  v_quantity bigint;
  v_non_rice_totals jsonb := '{"W1":0,"W2":0,"M1":0,"M2":0}'::jsonb;
  v_rice_totals jsonb := '{"W1":0,"W2":0,"M1":0,"M2":0}'::jsonb;
  v_non_rice_used jsonb := '{"W1":false,"W2":false,"M1":false,"M2":false}'::jsonb;
  v_rice_used jsonb := '{"W1":false,"W2":false,"M1":false,"M2":false}'::jsonb;
  v_threshold public.aya_b2b_qualification_thresholds%rowtype;
  v_reasons jsonb := '[]'::jsonb;
  v_cad text;
  v_value bigint;
  v_kg numeric(14,4);
begin
  select * into v_settings from public.aya_b2b_qualification_settings where singleton is true;
  if not found or not v_settings.qualification_enabled then
    raise exception using message = 'qualification_not_enabled', errcode = 'P0001';
  end if;
  if v_settings.evaluation_scope <> 'cadence_group' then
    raise exception using message = 'qualification_policy_incomplete', errcode = 'P0001';
  end if;
  if v_settings.value_basis <> 'supply_price' then
    raise exception using message = 'qualification_value_basis_incomplete', errcode = 'P0001';
  end if;

  if jsonb_typeof(v_rows) <> 'array' or jsonb_array_length(v_rows) < 1 or jsonb_array_length(v_rows) > 20 then
    raise exception using message = 'invalid_products', errcode = '22023';
  end if;

  for v_row in select value from jsonb_array_elements(v_rows)
  loop
    v_product_id := btrim(coalesce(v_row->>'productId',''));
    v_variant := btrim(coalesce(v_row->>'variant',''));
    v_unit := btrim(coalesce(v_row->>'unit',''));
    v_cadence := upper(btrim(coalesce(v_row->>'cadence','')));

    begin
      v_quantity := (v_row->>'quantity')::bigint;
    exception when others then
      raise exception using message = 'invalid_quantity', errcode = '22023';
    end;

    if v_quantity < 1 or v_quantity > 1000000 or v_cadence not in ('W1','W2','M1','M2') then
      raise exception using message = 'invalid_product_row', errcode = '22023';
    end if;

    select * into v_product from public.aya_product_master
      where product_id = v_product_id and active
      limit 1;
    if not found then
      v_reasons := v_reasons || jsonb_build_array('Ada produk yang belum tersedia untuk Pasokan Usaha.');
      continue;
    end if;

    select * into v_b2b_config from public.aya_b2b_product_config
      where product_id = v_product_id and active
      limit 1;
    if not found or not v_b2b_config.supply_eligible then
      v_reasons := v_reasons || jsonb_build_array('Ada produk yang belum tersedia untuk Pasokan Usaha.');
      continue;
    end if;

    select m.* into v_measurement
    from public.aya_b2b_measurements m
    join public.aya_product_variants pv
      on pv.product_id = m.product_id
     and pv.variant_name = m.variant_name
     and pv.active
    where m.product_id = v_product_id
      and m.variant_name = v_variant
      and m.unit_label = v_unit
    limit 1;

    if not found then
      raise exception using message = 'measurement_configuration_missing', errcode = 'P0001';
    end if;

    select * into v_econ from public.aya_b2b_measurement_economics_v1(v_measurement.id);
    if not coalesce(v_econ.commercial_ready,false) then
      raise exception using message = 'commercial_configuration_incomplete', errcode = 'P0001';
    end if;

    if v_b2b_config.product_class = 'rice' then
      if v_measurement.quantity_in_kg_per_unit is null then
        raise exception using message = 'rice_measurement_missing_kg_factor', errcode = 'P0001';
      end if;
      v_kg := coalesce((v_rice_totals->>v_cadence)::numeric,0) + (v_measurement.quantity_in_kg_per_unit * v_quantity);
      v_rice_totals := jsonb_set(v_rice_totals, array[v_cadence], to_jsonb(v_kg));
      v_rice_used := jsonb_set(v_rice_used, array[v_cadence], 'true'::jsonb);
    else
      v_value := coalesce((v_non_rice_totals->>v_cadence)::bigint,0) + (v_econ.supply_price * v_quantity);
      v_non_rice_totals := jsonb_set(v_non_rice_totals, array[v_cadence], to_jsonb(v_value));
      v_non_rice_used := jsonb_set(v_non_rice_used, array[v_cadence], 'true'::jsonb);
    end if;
  end loop;

  foreach v_cad in array array['W1','W2','M1','M2']
  loop
    if coalesce((v_rice_used->>v_cad)::boolean,false) then
      select * into v_threshold from public.aya_b2b_qualification_thresholds
        where rule_version = v_settings.active_rule_version
          and product_class = 'rice' and cadence = v_cad and active
        limit 1;
      if not found then raise exception using message = 'qualification_rule_missing', errcode = 'P0001'; end if;
      if (v_rice_totals->>v_cad)::numeric < v_threshold.minimum_quantity_kg then
        v_reasons := v_reasons || jsonb_build_array(format('Kebutuhan beras untuk ritme %s masih perlu disesuaikan.', v_cad));
      end if;
    end if;

    if coalesce((v_non_rice_used->>v_cad)::boolean,false) then
      select * into v_threshold from public.aya_b2b_qualification_thresholds
        where rule_version = v_settings.active_rule_version
          and product_class = 'standard' and cadence = v_cad and active
        limit 1;
      if not found then raise exception using message = 'qualification_rule_missing', errcode = 'P0001'; end if;
      if (v_non_rice_totals->>v_cad)::bigint < v_threshold.minimum_value then
        v_reasons := v_reasons || jsonb_build_array(format('Nilai kebutuhan untuk ritme %s masih perlu disesuaikan.', v_cad));
      end if;
    end if;
  end loop;

  if jsonb_array_length(v_reasons) > 0 then
    return jsonb_build_object(
      'status','adjust',
      'message','Ada bagian kebutuhan yang belum masuk kriteria Pasokan Usaha pada ritme yang dipilih.',
      'reasons',v_reasons,
      'ruleVersion',v_settings.active_rule_version
    );
  end if;

  return jsonb_build_object(
    'status','eligible',
    'message','Kebutuhan yang dimasukkan dapat melanjutkan proses Pasokan Usaha.',
    'ruleVersion',v_settings.active_rule_version
  );
end;
$$;

alter table public.aya_product_master enable row level security;
alter table public.aya_product_variants enable row level security;
alter table public.aya_b2b_product_config enable row level security;
alter table public.aya_b2b_measurements enable row level security;
alter table public.aya_b2b_measurement_cost_components enable row level security;
alter table public.aya_b2b_qualification_thresholds enable row level security;
alter table public.aya_b2b_qualification_settings enable row level security;

revoke all on table
  public.aya_product_master,
  public.aya_product_variants,
  public.aya_b2b_product_config,
  public.aya_b2b_measurements,
  public.aya_b2b_measurement_cost_components,
  public.aya_b2b_qualification_thresholds,
  public.aya_b2b_qualification_settings
from public, anon, authenticated;

grant select, insert, update, delete on table
  public.aya_product_master,
  public.aya_product_variants,
  public.aya_b2b_product_config,
  public.aya_b2b_measurements,
  public.aya_b2b_measurement_cost_components,
  public.aya_b2b_qualification_thresholds,
  public.aya_b2b_qualification_settings
to service_role;

revoke all on function public.aya_b2b_measurement_economics_v1(uuid) from public, anon, authenticated;
revoke all on function public.aya_b2b_qualify_v1(jsonb) from public, anon, authenticated;
grant execute on function public.aya_b2b_measurement_economics_v1(uuid) to service_role;
grant execute on function public.aya_b2b_qualify_v1(jsonb) to service_role;
