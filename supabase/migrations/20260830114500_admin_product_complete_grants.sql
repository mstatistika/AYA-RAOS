-- Complete Product creation uses the canonical economics helper under SECURITY INVOKER.
revoke all on function public.aya_b2b_measurement_economics_v1(uuid) from public,anon;
grant execute on function public.aya_b2b_measurement_economics_v1(uuid) to authenticated;
