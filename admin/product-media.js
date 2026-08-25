(() => {
  'use strict';
  const MAX_BYTES = 5 * 1024 * 1024;
  const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const state = { selected: null };
  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));

  function client() { return window.AYA_ADMIN_SB || window.AYA_ADMIN_AUTH?.supabase || null; }

  function validate(file) {
    if (!file) throw new Error('Pilih gambar terlebih dahulu.');
    if (!TYPES.has(file.type)) throw new Error('Format gambar harus JPG, PNG, atau WebP.');
    if (file.size > MAX_BYTES) throw new Error('Ukuran gambar maksimal 5 MB.');
  }

  async function uploadProductImage(productId, file) {
    validate(file);
    const sb = client();
    if (!sb) throw new Error('Supabase Admin belum siap.');
    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
    const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await sb.storage.from('aya-admin-media').upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;
    const { error: dbError } = await sb.rpc('aya_admin_set_product_image', { p_product_id: productId, p_image_path: path });
    if (dbError) {
      await sb.storage.from('aya-admin-media').remove([path]);
      throw dbError;
    }
    return path;
  }

  function mount() {
    const input = $('#productImageInput');
    const preview = $('#productImagePreview');
    const button = $('#productImageButton');
    if (!input || !preview || !button) return;
    button.onclick = () => input.click();
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        validate(file);
        state.selected = file;
        preview.src = URL.createObjectURL(file);
        preview.hidden = false;
      } catch (e) {
        state.selected = null;
        input.value = '';
        if (typeof window.msg === 'function') window.msg(e.message, 'error');
      }
    };
  }

  window.AYA_ADMIN_PRODUCT_MEDIA = { uploadProductImage, mount, state };
})();
