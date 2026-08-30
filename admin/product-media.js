(() => {
  'use strict';
  const MAX_BYTES = 5 * 1024 * 1024;
  const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
  const state = { selected: null, previewUrl: null };
  const $ = (s) => document.querySelector(s);

  function client() {
    const sb = window.AYA_ADMIN_AUTH;
    if (!sb) throw new Error('Supabase Admin belum siap.');
    return sb;
  }

  function validate(file) {
    if (!file) throw new Error('Pilih gambar terlebih dahulu.');
    if (!TYPES.has(file.type)) throw new Error('Format gambar harus JPG, PNG, atau WebP.');
    if (file.size > MAX_BYTES) throw new Error('Ukuran gambar maksimal 5 MB.');
  }

  function clearSelection() {
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    state.selected = null;
    state.previewUrl = null;
    const input = $('#productImageInput');
    const preview = $('#productImagePreview');
    if (input) input.value = '';
    if (preview) {
      preview.removeAttribute('src');
      preview.hidden = true;
    }
  }

  async function uploadProductImage(productId, file) {
    validate(file);
    const sb = client();
    const ext = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
    const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await sb.storage
      .from('aya-admin-media')
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) throw uploadError;

    const { error: dbError } = await sb.rpc('aya_admin_set_product_image', {
      p_product_id: productId,
      p_image_path: path
    });
    if (dbError) {
      await sb.storage.from('aya-admin-media').remove([path]);
      throw dbError;
    }
    return path;
  }

  async function signedUrl(path, expiresIn = 900) {
    if (!path) return null;
    const { data, error } = await client().storage
      .from('aya-admin-media')
      .createSignedUrl(path, expiresIn);
    if (error) throw error;
    return data?.signedUrl || null;
  }

  function mount() {
    clearSelection();
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
        if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
        state.selected = file;
        state.previewUrl = URL.createObjectURL(file);
        preview.src = state.previewUrl;
        preview.hidden = false;
      } catch (e) {
        clearSelection();
        const message = document.querySelector('#globalMessage');
        if (message) {
          message.hidden = false;
          message.className = 'message error';
          message.textContent = e.message;
        }
      }
    };
  }

  window.AYA_ADMIN_PRODUCT_MEDIA = {
    uploadProductImage,
    signedUrl,
    mount,
    clearSelection,
    state
  };
})();
