(() => {
  'use strict';

  const config = window.AYA_CONFIG?.supabase || {};
  const isPreviewBypass = window.AYA_CONFIG?.previewAdminBypass === true;
  const previewUserId = window.AYA_CONFIG?.previewAdminUserId || 'c8b72460-9c4e-4f93-8916-cb8c4f131831';

  if (!isPreviewBypass) {
    if (!window.supabase?.createClient) throw new Error('Supabase client library gagal dimuat.');
    const create = window.supabase.createClient.bind(window.supabase);
    const shared = create(config.url, config.publishableKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
    window.AYA_ADMIN_SUPABASE = shared;
    window.supabase.createClient = () => shared;
    return;
  }

  const endpoint = `${window.location.origin}/api/admin-preview`;
  const previewSession = Object.freeze({
    user: Object.freeze({ id: previewUserId, email: 'preview-admin@aya-raos.local' }),
    access_token: 'preview-server-session'
  });

  const api = async (payload) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    });
    let body = null;
    try { body = await response.json(); } catch (_) { body = null; }
    if (!response.ok || body?.ok === false) {
      const error = new Error(body?.detail || body?.error || `Preview API error (${response.status})`);
      error.code = body?.error || 'preview_api_error';
      error.status = response.status;
      throw error;
    }
    return body;
  };

  const resultError = (error) => ({ message: error?.message || String(error), code: error?.code || 'preview_api_error', details: error?.detail || '', hint: '' });

  class QueryBuilder {
    constructor(table) {
      this.table = table;
      this.operation = 'select';
      this.selectColumns = '*';
      this.filters = [];
      this.orders = [];
      this.limitValue = undefined;
      this.offsetValue = undefined;
      this.head = false;
      this.payload = null;
      this.singleResult = false;
    }
    select(columns = '*', options = {}) { this.selectColumns = columns; this.head = Boolean(options.head); return this; }
    eq(column, value) { this.filters.push({ column, operator: 'eq', value }); return this; }
    neq(column, value) { this.filters.push({ column, operator: 'neq', value }); return this; }
    gt(column, value) { this.filters.push({ column, operator: 'gt', value }); return this; }
    gte(column, value) { this.filters.push({ column, operator: 'gte', value }); return this; }
    lt(column, value) { this.filters.push({ column, operator: 'lt', value }); return this; }
    lte(column, value) { this.filters.push({ column, operator: 'lte', value }); return this; }
    in(column, values) { this.filters.push({ column, operator: 'in', value: values }); return this; }
    order(column, options = {}) { this.orders.push({ column, ascending: options.ascending !== false }); return this; }
    limit(value) { this.limitValue = Number(value); return this; }
    range(from, to) { this.offsetValue = Number(from); this.limitValue = Number(to) - Number(from) + 1; return this; }
    insert(payload) { this.operation = 'insert'; this.payload = payload; return this; }
    update(payload) { this.operation = 'update'; this.payload = payload; return this; }
    single() { this.singleResult = true; return this; }
    maybeSingle() { this.singleResult = true; return this; }
    async execute() {
      try {
        if (this.operation === 'select') {
          const body = await api({ op: 'select', table: this.table, select: this.selectColumns, filters: this.filters, orders: this.orders, limit: this.limitValue, offset: this.offsetValue, head: this.head });
          if (this.head) return { data: null, error: null, count: body.count ?? 0 };
          const data = body.data || [];
          return { data: this.singleResult ? (data[0] || null) : data, error: null, count: body.count ?? data.length };
        }
        const body = await api({ op: this.operation, table: this.table, filters: this.filters, payload: this.payload });
        const data = body.data || [];
        return { data: this.singleResult ? (data[0] || null) : data, error: null, count: data.length };
      } catch (error) {
        return { data: null, error: resultError(error), count: null };
      }
    }
    then(resolve, reject) { return this.execute().then(resolve, reject); }
  }

  const previewClient = {
    from(table) { return new QueryBuilder(table); },
    async rpc(functionName, args = {}) {
      try { const body = await api({ op: 'rpc', functionName, args }); return { data: body.data ?? null, error: null }; }
      catch (error) { return { data: null, error: resultError(error) }; }
    },
    storage: {
      from(bucket) {
        return {
          async upload(objectPath, file, options = {}) {
            try {
              const bytes = new Uint8Array(await file.arrayBuffer());
              let binary = '';
              const chunk = 0x8000;
              for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
              const body = await api({ op: 'upload', bucket, objectPath, contentType: options.contentType || file.type || 'application/octet-stream', base64: btoa(binary) });
              return { data: body.data || { path: objectPath }, error: null };
            } catch (error) { return { data: null, error: resultError(error) }; }
          },
          async createSignedUrl(objectPath, expiresIn = 120) {
            try { const body = await api({ op: 'signed-url', bucket, objectPath, expiresIn }); return { data: body.data, error: null }; }
            catch (error) { return { data: null, error: resultError(error) }; }
          }
        };
      }
    },
    auth: {
      async getSession() { return { data: { session: previewSession }, error: null }; },
      async signInWithPassword() { return { data: { session: previewSession }, error: null }; },
      async signOut() { return { error: null }; },
      onAuthStateChange() { return { data: { subscription: { unsubscribe() {} } } }; }
    }
  };

  window.AYA_ADMIN_SUPABASE = previewClient;
  window.supabase.createClient = () => previewClient;
  window.AYA_ADMIN_PREVIEW = Object.freeze({ enabled: true, endpoint });
})();
