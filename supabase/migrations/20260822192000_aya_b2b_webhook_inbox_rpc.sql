-- Trusted server boundary for payment webhook inbox.
-- Signature verification happens in the provider adapter before this RPC is called.

create or replace function public.aya_b2b_receive_payment_webhook_v1(
  p_provider text,
  p_provider_event_id text,
  p_event_type text,
  p_signature_verified boolean,
  p_payload jsonb
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_id uuid;
begin
  if p_provider not in ('doku','midtrans') then raise exception 'Unsupported provider'; end if;
  if not p_signature_verified then raise exception 'Webhook signature is not verified'; end if;
  insert into public.aya_b2b_payment_webhook_events(provider,provider_event_id,event_type,signature_verified,payload)
  values(p_provider,p_provider_event_id,p_event_type,true,coalesce(p_payload,'{}'::jsonb))
  on conflict(provider,provider_event_id) do update
    set payload=excluded.payload,
        event_type=excluded.event_type,
        signature_verified=true
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.aya_b2b_receive_payment_webhook_v1(text,text,text,boolean,jsonb) from anon,authenticated;
