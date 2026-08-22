-- AYA RAOS Admin Platform v1 — access to canonical AYA domain tables.
-- Human Admin may read/operate only through function-scoped RLS. Payment verification remains system-owned.

grant select,update on public.aya_catalog_products,public.aya_catalog_variants,public.aya_testimonials,public.aya_b2b_product_config,public.aya_b2b_measurements,public.aya_b2b_measurement_cost_components,public.aya_b2b_qualification_settings,public.aya_b2b_qualification_thresholds to authenticated;
grant select,insert,update on public.aya_product_master,public.aya_product_variants to authenticated;
grant select on public.aya_orders,public.aya_order_items,public.aya_order_events,public.aya_business_inquiries,public.aya_business_inquiry_items,public.aya_business_inquiry_events to authenticated;
grant update(order_status) on public.aya_orders to authenticated;
grant select on public.aya_b2b_companies,public.aya_b2b_company_members,public.aya_b2b_company_contact_channels,public.aya_b2b_user_profiles,public.aya_b2b_relationships,public.aya_b2b_commercial_summaries,public.aya_b2b_commercial_summary_items to authenticated;
grant select on public.aya_b2b_invoices,public.aya_b2b_payment_obligations,public.aya_b2b_payment_attempts,public.aya_b2b_payment_settlements to authenticated;
grant select on public.aya_b2b_delivery_occurrences,public.aya_b2b_delivery_events,public.aya_b2b_credit_ledger to authenticated;

-- Product / public commercial layer.
drop policy if exists aya_admin_catalog_products_select on public.aya_catalog_products;
create policy aya_admin_catalog_products_select on public.aya_catalog_products for select to authenticated using(private.aya_admin_has_function('product.view'));
drop policy if exists aya_admin_catalog_products_update on public.aya_catalog_products;
create policy aya_admin_catalog_products_update on public.aya_catalog_products for update to authenticated using(private.aya_admin_has_function('product.edit')) with check(private.aya_admin_has_function('product.edit'));
drop policy if exists aya_admin_catalog_variants_select on public.aya_catalog_variants;
create policy aya_admin_catalog_variants_select on public.aya_catalog_variants for select to authenticated using(private.aya_admin_has_function('product.view'));
drop policy if exists aya_admin_catalog_variants_update on public.aya_catalog_variants;
create policy aya_admin_catalog_variants_update on public.aya_catalog_variants for update to authenticated using(private.aya_admin_has_function('product.variant.edit')) with check(private.aya_admin_has_function('product.variant.edit'));

-- Target Product Master identity layer.
drop policy if exists aya_admin_product_master_select on public.aya_product_master;
create policy aya_admin_product_master_select on public.aya_product_master for select to authenticated using(private.aya_admin_has_function('product.view'));
drop policy if exists aya_admin_product_master_insert on public.aya_product_master;
create policy aya_admin_product_master_insert on public.aya_product_master for insert to authenticated with check(private.aya_admin_has_function('product.edit'));
drop policy if exists aya_admin_product_master_update on public.aya_product_master;
create policy aya_admin_product_master_update on public.aya_product_master for update to authenticated using(private.aya_admin_has_function('product.edit')) with check(private.aya_admin_has_function('product.edit'));
drop policy if exists aya_admin_product_variants_select on public.aya_product_variants;
create policy aya_admin_product_variants_select on public.aya_product_variants for select to authenticated using(private.aya_admin_has_function('product.view'));
drop policy if exists aya_admin_product_variants_insert on public.aya_product_variants;
create policy aya_admin_product_variants_insert on public.aya_product_variants for insert to authenticated with check(private.aya_admin_has_function('product.variant.edit'));
drop policy if exists aya_admin_product_variants_update on public.aya_product_variants;
create policy aya_admin_product_variants_update on public.aya_product_variants for update to authenticated using(private.aya_admin_has_function('product.variant.edit')) with check(private.aya_admin_has_function('product.variant.edit'));

-- B2C.
drop policy if exists aya_admin_orders_select on public.aya_orders;
create policy aya_admin_orders_select on public.aya_orders for select to authenticated using(private.aya_admin_has_function('b2c.view'));
drop policy if exists aya_admin_orders_update on public.aya_orders;
create policy aya_admin_orders_update on public.aya_orders for update to authenticated using(private.aya_admin_has_function('b2c.order.status.edit')) with check(private.aya_admin_has_function('b2c.order.status.edit'));
drop policy if exists aya_admin_order_items_select on public.aya_order_items;
create policy aya_admin_order_items_select on public.aya_order_items for select to authenticated using(private.aya_admin_has_function('b2c.view'));
drop policy if exists aya_admin_order_events_select on public.aya_order_events;
create policy aya_admin_order_events_select on public.aya_order_events for select to authenticated using(private.aya_admin_has_function('b2c.view'));

-- Testimonials.
drop policy if exists aya_admin_testimonials_select on public.aya_testimonials;
create policy aya_admin_testimonials_select on public.aya_testimonials for select to authenticated using(private.aya_admin_has_function('testimonial.view'));
drop policy if exists aya_admin_testimonials_moderate on public.aya_testimonials;
create policy aya_admin_testimonials_moderate on public.aya_testimonials for update to authenticated using(private.aya_admin_has_function('testimonial.moderate') or private.aya_admin_has_function('testimonial.publish') or private.aya_admin_has_function('testimonial.display_order')) with check(private.aya_admin_has_function('testimonial.moderate') or private.aya_admin_has_function('testimonial.publish') or private.aya_admin_has_function('testimonial.display_order'));

-- B2B product/economics/rules.
drop policy if exists aya_admin_b2b_product_config_select on public.aya_b2b_product_config;
create policy aya_admin_b2b_product_config_select on public.aya_b2b_product_config for select to authenticated using(private.aya_admin_has_function('b2b.view') or private.aya_admin_has_function('product.b2b.manage'));
drop policy if exists aya_admin_b2b_product_config_update on public.aya_b2b_product_config;
create policy aya_admin_b2b_product_config_update on public.aya_b2b_product_config for update to authenticated using(private.aya_admin_has_function('product.b2b.manage')) with check(private.aya_admin_has_function('product.b2b.manage'));
drop policy if exists aya_admin_b2b_measurements_select on public.aya_b2b_measurements;
create policy aya_admin_b2b_measurements_select on public.aya_b2b_measurements for select to authenticated using(private.aya_admin_has_function('b2b.view') or private.aya_admin_has_function('product.b2b.manage'));
drop policy if exists aya_admin_b2b_measurements_update on public.aya_b2b_measurements;
create policy aya_admin_b2b_measurements_update on public.aya_b2b_measurements for update to authenticated using(private.aya_admin_has_function('b2b.cogs.edit') or private.aya_admin_has_function('b2b.unit_price.edit') or private.aya_admin_has_function('product.b2b.manage')) with check(private.aya_admin_has_function('b2b.cogs.edit') or private.aya_admin_has_function('b2b.unit_price.edit') or private.aya_admin_has_function('product.b2b.manage'));
drop policy if exists aya_admin_b2b_cost_components_select on public.aya_b2b_measurement_cost_components;
create policy aya_admin_b2b_cost_components_select on public.aya_b2b_measurement_cost_components for select to authenticated using(private.aya_admin_has_function('b2b.cogs.view'));
drop policy if exists aya_admin_b2b_cost_components_update on public.aya_b2b_measurement_cost_components;
create policy aya_admin_b2b_cost_components_update on public.aya_b2b_measurement_cost_components for update to authenticated using(private.aya_admin_has_function('b2b.cogs.edit')) with check(private.aya_admin_has_function('b2b.cogs.edit'));
drop policy if exists aya_admin_b2b_settings_select on public.aya_b2b_qualification_settings;
create policy aya_admin_b2b_settings_select on public.aya_b2b_qualification_settings for select to authenticated using(private.aya_admin_has_function('b2b.view') or private.aya_admin_has_function('system.rules.manage'));
drop policy if exists aya_admin_b2b_thresholds_select on public.aya_b2b_qualification_thresholds;
create policy aya_admin_b2b_thresholds_select on public.aya_b2b_qualification_thresholds for select to authenticated using(private.aya_admin_has_function('b2b.view') or private.aya_admin_has_function('system.rules.manage'));

-- B2B identity, relationship and immutable commercial snapshots.
do $$
declare t text;
begin
  foreach t in array array['aya_b2b_companies','aya_b2b_company_members','aya_b2b_company_contact_channels','aya_b2b_user_profiles','aya_b2b_relationships','aya_b2b_commercial_summaries'] loop
    execute format('drop policy if exists aya_admin_%I_select on public.%I',t,t);
    execute format('create policy aya_admin_%I_select on public.%I for select to authenticated using (private.aya_admin_has_function(''b2b.view''))',t,t);
  end loop;
end $$;
drop policy if exists aya_admin_b2b_summary_items_select on public.aya_b2b_commercial_summary_items;
create policy aya_admin_b2b_summary_items_select on public.aya_b2b_commercial_summary_items for select to authenticated using(private.aya_admin_has_function('b2b.view') or private.aya_admin_has_function('finance.view'));

-- Billing/payment/settlement are intentionally read-only to human Admin here.
drop policy if exists aya_admin_b2b_invoices_select on public.aya_b2b_invoices;
create policy aya_admin_b2b_invoices_select on public.aya_b2b_invoices for select to authenticated using(private.aya_admin_has_function('invoice.view') or private.aya_admin_has_function('finance.view'));
drop policy if exists aya_admin_b2b_obligations_select on public.aya_b2b_payment_obligations;
create policy aya_admin_b2b_obligations_select on public.aya_b2b_payment_obligations for select to authenticated using(private.aya_admin_has_function('payment.view') or private.aya_admin_has_function('finance.view'));
drop policy if exists aya_admin_b2b_attempts_select on public.aya_b2b_payment_attempts;
create policy aya_admin_b2b_attempts_select on public.aya_b2b_payment_attempts for select to authenticated using(private.aya_admin_has_function('payment.view') or private.aya_admin_has_function('finance.view'));
drop policy if exists aya_admin_b2b_settlements_select on public.aya_b2b_payment_settlements;
create policy aya_admin_b2b_settlements_select on public.aya_b2b_payment_settlements for select to authenticated using(private.aya_admin_has_function('settlement.view') or private.aya_admin_has_function('finance.view'));

-- Delivery and immutable Kredit Pasokan ledger.
drop policy if exists aya_admin_b2b_deliveries_select on public.aya_b2b_delivery_occurrences;
create policy aya_admin_b2b_deliveries_select on public.aya_b2b_delivery_occurrences for select to authenticated using(private.aya_admin_has_function('b2b.view'));
drop policy if exists aya_admin_b2b_delivery_events_select on public.aya_b2b_delivery_events;
create policy aya_admin_b2b_delivery_events_select on public.aya_b2b_delivery_events for select to authenticated using(private.aya_admin_has_function('b2b.view'));
drop policy if exists aya_admin_b2b_credit_ledger_select on public.aya_b2b_credit_ledger;
create policy aya_admin_b2b_credit_ledger_select on public.aya_b2b_credit_ledger for select to authenticated using(private.aya_admin_has_function('credit.view') or private.aya_admin_has_function('b2b.view'));
