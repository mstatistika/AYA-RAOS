-- AYA RAOS Admin — complete Product creation foundation
-- Extends the existing Product Master flow without auto-publishing the storefront.

alter table public.aya_catalog_variants
  add column if not exists unit_label text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'aya_catalog_variant_unit_label_check'
      and conrelid = 'public.aya_catalog_variants'::regclass
  ) then
    alter table public.aya_catalog_variants
      add constraint aya_catalog_variant_unit_label_check
      check (unit_label is null or char_length(btrim(unit_label)) between 1 and 40);
  end if;
end $$;

-- Reuse already-configured B2B unit labels as the safest seed for existing B2C variants.
update public.aya_catalog_variants cv
set unit_label = m.unit_label,
    updated_at = now()
from public.aya_b2b_measurements m
where cv.product_id = m.product_id
  and cv.variant_name = m.variant_name
  and cv.unit_label is null;

grant insert on public.aya_catalog_products,
                public.aya_catalog_variants,
                public.aya_b2b_product_config,
                public.aya_b2b_measurements,
                public.aya_b2b_measurement_cost_components
  to authenticated;

drop policy if exists aya_admin_catalog_products_insert on public.aya_catalog_products;
create policy aya_admin_catalog_products_insert
on public.aya_catalog_products for insert to authenticated
with check (private.aya_admin_has_function('product.edit'));

drop policy if exists aya_admin_catalog_variants_insert on public.aya_catalog_variants;
create policy aya_admin_catalog_variants_insert
on public.aya_catalog_variants for insert to authenticated
with check (private.aya_admin_has_function('product.variant.edit'));

drop policy if exists aya_admin_b2b_product_config_insert on public.aya_b2b_product_config;
create policy aya_admin_b2b_product_config_insert
on public.aya_b2b_product_config for insert to authenticated
with check (private.aya_admin_has_function('product.b2b.manage'));

drop policy if exists aya_admin_b2b_measurements_insert on public.aya_b2b_measurements;
create policy aya_admin_b2b_measurements_insert
on public.aya_b2b_measurements for insert to authenticated
with check (private.aya_admin_has_function('product.b2b.manage'));

drop policy if exists aya_admin_b2b_cost_components_insert on public.aya_b2b_measurement_cost_components;
create policy aya_admin_b2b_cost_components_insert
on public.aya_b2b_measurement_cost_components for insert to authenticated
with check (private.aya_admin_has_function('b2b.cogs.edit'));

create or replace function public.aya_admin_create_product_complete(
  p_product_id text,
  p_product_name text,
  p_line_name text,
  p_category_name text,
  p_active boolean,
  p_variant_name text,
  p_b2c_unit_label text,
  p_final_unit_price bigint,
  p_public_status text default 'Habis',
  p_visible boolean default false,
  p_orderable boolean default false,
  p_min_quantity integer default 1,
  p_product_class text default 'standard',
  p_supply_eligible boolean default false,
  p_b2b_unit_label text default null,
  p_quantity_in_kg_per_unit numeric default null,
  p_base_cost bigint default null,
  p_additional_cost bigint default 0,
  p_commercial_enabled boolean default false
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, private
as $$
declare
  v_measurement_id uuid;
  v_econ record;
  v_b2b_unit text;
  v_enable boolean := false;
begin
  if (select auth.uid()) is null
     or not private.aya_admin_has_function('product.edit')
     or not private.aya_admin_has_function('product.variant.edit') then
    raise exception 'Akses Product Master ditolak.';
  end if;

  if not private.aya_admin_has_function('product.b2b.manage') then
    raise exception 'Akses B2B Product Master ditolak.';
  end if;

  if p_base_cost is not null or coalesce(p_additional_cost,0) > 0 then
    if not private.aya_admin_has_function('b2b.cogs.edit') then
      raise exception 'Akses edit COGS ditolak.';
    end if;
  end if;

  if p_final_unit_price is not null
     and not private.aya_admin_has_function('b2b.unit_price.edit') then
    raise exception 'Akses edit Final Unit Price ditolak.';
  end if;

  if p_product_id !~ '^[a-z0-9][a-z0-9-]{1,79}$' then
    raise exception 'Product ID tidak valid.';
  end if;
  if char_length(btrim(coalesce(p_product_name,''))) < 1 then
    raise exception 'Product Name wajib diisi.';
  end if;
  if char_length(btrim(coalesce(p_variant_name,''))) < 1 then
    raise exception 'Initial Variant wajib diisi.';
  end if;
  if char_length(btrim(coalesce(p_b2c_unit_label,''))) < 1 then
    raise exception 'Measurement Unit B2C wajib diisi.';
  end if;
  if p_final_unit_price is null or p_final_unit_price < 0 then
    raise exception 'Final Unit Price wajib diisi dan tidak boleh negatif.';
  end if;
  if p_public_status not in ('Tersedia','Pre-order','Habis') then
    raise exception 'Public Status tidak valid.';
  end if;
  if p_product_class not in ('rice','standard') then
    raise exception 'Product Class B2B tidak valid.';
  end if;
  if p_min_quantity is null or p_min_quantity < 1 then
    raise exception 'Minimum quantity B2C minimal 1.';
  end if;
  if p_base_cost is not null and p_base_cost < 0 then
    raise exception 'Base Cost tidak boleh negatif.';
  end if;
  if coalesce(p_additional_cost,0) < 0 then
    raise exception 'Additional Cost tidak boleh negatif.';
  end if;
  if p_quantity_in_kg_per_unit is not null and p_quantity_in_kg_per_unit <= 0 then
    raise exception 'Quantity kg per unit harus lebih dari 0.';
  end if;
  if exists(select 1 from public.aya_product_master where product_id=p_product_id) then
    raise exception 'Product ID sudah digunakan.';
  end if;

  v_b2b_unit := coalesce(nullif(btrim(coalesce(p_b2b_unit_label,'')),''), btrim(p_b2c_unit_label));

  insert into public.aya_product_master(product_id,product_name,line_name,category_name,active)
  values(p_product_id,btrim(p_product_name),btrim(p_line_name),btrim(p_category_name),coalesce(p_active,true));

  insert into public.aya_product_variants(product_id,variant_name,active)
  values(p_product_id,btrim(p_variant_name),true);

  -- B2C remains safely unpublished by default. Admin explicitly controls visible/orderable/status.
  insert into public.aya_catalog_products(
    product_id,product_name,line_name,category_name,public_status,visible,orderable,
    min_quantity,max_quantity,quantity_step,supply_eligible
  ) values(
    p_product_id,btrim(p_product_name),btrim(p_line_name),btrim(p_category_name),
    p_public_status,coalesce(p_visible,false),coalesce(p_orderable,false),p_min_quantity,null,1,
    coalesce(p_supply_eligible,false)
  );

  insert into public.aya_catalog_variants(product_id,variant_name,unit_price,orderable,unit_label)
  values(
    p_product_id,btrim(p_variant_name),p_final_unit_price,coalesce(p_orderable,false),
    btrim(p_b2c_unit_label)
  );

  insert into public.aya_b2b_product_config(product_id,product_class,supply_eligible,active)
  values(p_product_id,p_product_class,coalesce(p_supply_eligible,false),coalesce(p_active,true));

  insert into public.aya_b2b_measurements(
    product_id,variant_name,unit_label,quantity_in_kg_per_unit,base_cost,final_unit_price,commercial_enabled
  ) values(
    p_product_id,btrim(p_variant_name),v_b2b_unit,p_quantity_in_kg_per_unit,p_base_cost,p_final_unit_price,false
  ) returning id into v_measurement_id;

  if coalesce(p_additional_cost,0) > 0 then
    insert into public.aya_b2b_measurement_cost_components(
      measurement_id,component_code,component_label,amount,active
    ) values(
      v_measurement_id,'initial_additional','Additional Cost',p_additional_cost,true
    );
  end if;

  select * into v_econ
  from public.aya_b2b_measurement_economics_v1(v_measurement_id);

  if coalesce(p_commercial_enabled,false) then
    if not coalesce(p_supply_eligible,false) then
      raise exception 'Commercial B2B tidak dapat diaktifkan jika Pasokan Eligibility = Tidak.';
    end if;
    if not coalesce(v_econ.margin_valid,false) then
      raise exception 'Margin B2B harus lebih dari 0 sebelum Commercial dapat diaktifkan.';
    end if;
    v_enable := true;
    update public.aya_b2b_measurements
    set commercial_enabled=true,updated_at=now()
    where id=v_measurement_id;
  end if;

  insert into public.aya_admin_audit_log(
    actor_user_id,effective_function,entity_type,entity_id,action,after_data
  ) values(
    (select auth.uid()),
    'product.edit',
    'product_master',
    p_product_id,
    'create_complete',
    jsonb_build_object(
      'product_name',btrim(p_product_name),
      'line_name',btrim(p_line_name),
      'category_name',btrim(p_category_name),
      'variant_name',btrim(p_variant_name),
      'b2c_unit_label',btrim(p_b2c_unit_label),
      'final_unit_price',p_final_unit_price,
      'public_status',p_public_status,
      'visible',coalesce(p_visible,false),
      'orderable',coalesce(p_orderable,false),
      'product_class',p_product_class,
      'supply_eligible',coalesce(p_supply_eligible,false),
      'b2b_unit_label',v_b2b_unit,
      'base_cost',p_base_cost,
      'additional_cost',coalesce(p_additional_cost,0),
      'cogs',v_econ.cogs,
      'recommended_unit_price',v_econ.recommended_unit_price,
      'supply_price',v_econ.supply_price,
      'margin',v_econ.margin,
      'commercial_enabled',v_enable
    )
  );

  return jsonb_build_object(
    'productId',p_product_id,
    'measurementId',v_measurement_id,
    'cogs',v_econ.cogs,
    'recommendedUnitPrice',v_econ.recommended_unit_price,
    'finalUnitPrice',v_econ.final_unit_price,
    'supplyPrice',v_econ.supply_price,
    'margin',v_econ.margin,
    'marginValid',v_econ.margin_valid,
    'commercialEnabled',v_enable
  );
end;
$$;

revoke all on function public.aya_admin_create_product_complete(
  text,text,text,text,boolean,text,text,bigint,text,boolean,boolean,integer,text,boolean,text,numeric,bigint,bigint,boolean
) from public,anon;
grant execute on function public.aya_admin_create_product_complete(
  text,text,text,text,boolean,text,text,bigint,text,boolean,boolean,integer,text,boolean,text,numeric,bigint,bigint,boolean
) to authenticated;

-- Product image metadata does not require SECURITY DEFINER; authenticated RLS remains authoritative.
create or replace function public.aya_admin_set_product_image(p_product_id text,p_image_path text)
returns public.aya_product_master
language plpgsql
security invoker
set search_path = pg_catalog, public, private
as $$
declare v_row public.aya_product_master;
begin
  if (select auth.uid()) is null or not private.aya_admin_has_function('product.edit') then
    raise exception 'Akses Product Master ditolak.';
  end if;
  if p_image_path is null or length(btrim(p_image_path))=0 then
    raise exception 'IMAGE_PATH_REQUIRED';
  end if;
  update public.aya_product_master
     set image_path=btrim(p_image_path),
         image_alt=coalesce(nullif(image_alt,''),product_name),
         updated_at=now()
   where product_id=p_product_id
   returning * into v_row;
  if not found then raise exception 'PRODUCT_NOT_FOUND'; end if;
  insert into public.aya_admin_audit_log(
    actor_user_id,effective_function,entity_type,entity_id,action,after_data
  ) values(
    (select auth.uid()),'product.edit','product_master',p_product_id,'set_image',
    jsonb_build_object('image_path',btrim(p_image_path))
  );
  return v_row;
end;
$$;

revoke all on function public.aya_admin_set_product_image(text,text) from public,anon;
grant execute on function public.aya_admin_set_product_image(text,text) to authenticated;
