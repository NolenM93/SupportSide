(function () {
  const STORAGE_KEY = 'supportside_giftshop_inventory_v1';
  const AUTH_KEY = 'supportside_giftshop_auth';
  const THEME_KEY = 'supportside_giftshop_theme';
  const DEMO_EMAIL = 'demo@giftshop.local';
  const DEMO_PASS = 'demo1234';

  const THEMES = [
    {
      id: 'classic',
      name: 'Classic',
      desc: 'Clean indigo — the default Support Side look.',
      swatches: ['#0f172a', '#4f46e5', '#f1f5f9', '#ffffff']
    },
    {
      id: 'dark',
      name: 'Dark',
      desc: 'Low-light slate with soft indigo accents.',
      swatches: ['#020617', '#818cf8', '#1a2332', '#0b1220']
    },
    {
      id: 'ocean',
      name: 'Ocean',
      desc: 'Cool teal tones for a fresh retail feel.',
      swatches: ['#0e4d5c', '#0891b2', '#ecfeff', '#ffffff']
    },
    {
      id: 'forest',
      name: 'Forest',
      desc: 'Green and earthy — great for gift & lifestyle brands.',
      swatches: ['#14532d', '#15803d', '#f0fdf4', '#ffffff']
    },
    {
      id: 'sunset',
      name: 'Sunset',
      desc: 'Warm amber accents with an inviting glow.',
      swatches: ['#7c2d12', '#ea580c', '#fff7ed', '#ffffff']
    }
  ];

  const $ = (id) => document.getElementById(id);

  function getTheme() {
    try {
      return localStorage.getItem(THEME_KEY) || 'classic';
    } catch {
      return 'classic';
    }
  }

  function applyTheme(id) {
    const theme = THEMES.find((t) => t.id === id) ? id : 'classic';
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
    renderThemePicker();
  }

  function renderThemePicker() {
    const picker = $('theme-picker');
    if (!picker) return;
    const active = getTheme();
    picker.innerHTML = THEMES.map((t) => `
      <button type="button" class="theme-card${t.id === active ? ' is-active' : ''}" data-theme-id="${t.id}" aria-pressed="${t.id === active}">
        <div class="theme-card-swatch" aria-hidden="true">
          ${t.swatches.map((c) => `<span style="background:${c}"></span>`).join('')}
        </div>
        <div class="theme-card-meta">
          <span class="theme-card-name">${t.name}</span>
          <span class="theme-card-desc">${t.desc}</span>
        </div>
        <span class="theme-card-check">Selected</span>
      </button>`).join('');
    picker.querySelectorAll('[data-theme-id]').forEach((btn) => {
      btn.addEventListener('click', () => applyTheme(btn.getAttribute('data-theme-id')));
    });
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    try {
      return JSON.parse(raw);
    } catch {
      return seedState();
    }
  }

  function seedState() {
    const seed = window.GIFTSHOP_SEED;
    const state = {
      products: seed.products.map((p) => ({ ...p })),
      activity: seed.activity.map((a) => ({ ...a }))
    };
    saveState(state);
    return state;
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadState();

  function isLoggedIn() {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  }

  function showApp() {
    $('view-login').classList.add('hidden');
    $('view-app').classList.remove('hidden');
    renderAll();
    renderThemePicker();
    if (window.GiftshopTour) window.GiftshopTour.start();
  }

  function showLogin() {
    $('view-app').classList.add('hidden');
    $('view-login').classList.remove('hidden');
    if (window.GiftshopTour) window.GiftshopTour.stop();
  }

  function money(n) {
    return '$' + Number(n).toFixed(2);
  }

  function formatWhen(ts) {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
    });
  }

  function lowProducts() {
    return state.products.filter((p) => p.qty <= p.reorderAt);
  }

  function renderStats() {
    $('stat-products').textContent = String(state.products.length);
    $('stat-units').textContent = String(state.products.reduce((s, p) => s + p.qty, 0));
    $('stat-low').textContent = String(lowProducts().length);
  }

  function renderActivity() {
    const list = $('recent-activity');
    const items = [...state.activity].sort((a, b) => b.at - a.at).slice(0, 8);
    if (!items.length) {
      list.innerHTML = '<li class="py-3 text-slate-400">No activity yet.</li>';
      return;
    }
    list.innerHTML = items.map((a) => {
      const verb = a.type === 'in' ? 'Stock in' : a.type === 'out' ? 'Stock out' : 'Set qty';
      const sign = a.type === 'in' ? '+' : a.type === 'out' ? '-' : '';
      return `<li class="py-3 flex justify-between gap-4">
        <div>
          <p class="font-medium text-slate-800">${escapeHtml(a.label)}</p>
          <p class="text-slate-500">${verb}${a.note ? ' · ' + escapeHtml(a.note) : ''}</p>
        </div>
        <div class="text-right shrink-0">
          <p class="font-semibold">${sign}${a.qty}</p>
          <p class="text-xs text-slate-400">${formatWhen(a.at)}</p>
        </div>
      </li>`;
    }).join('');
  }

  function qtyClass(p) {
    if (p.qty <= 0) return 'qty-out';
    if (p.qty <= p.reorderAt) return 'qty-low';
    return '';
  }

  function renderProducts() {
    const q = ($('search').value || '').trim().toLowerCase();
    let rows = state.products;
    if (q) {
      rows = rows.filter((p) =>
        p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      );
    }
    rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    const body = $('products-body');
    if (!rows.length) {
      body.innerHTML = '<tr><td colspan="7" class="px-4 py-8 text-center text-slate-400">No products match.</td></tr>';
      return;
    }
    body.innerHTML = rows.map((p) => `<tr>
      <td class="px-4 py-3 font-mono text-xs text-slate-500">${escapeHtml(p.sku)}</td>
      <td class="px-4 py-3 font-medium">${escapeHtml(p.name)}</td>
      <td class="px-4 py-3 text-slate-500">${escapeHtml(p.category)}</td>
      <td class="px-4 py-3 text-right ${qtyClass(p)}">${p.qty}</td>
      <td class="px-4 py-3 text-right">${money(p.price)}</td>
      <td class="px-4 py-3 text-right text-slate-500">${p.reorderAt}</td>
      <td class="px-4 py-3 text-right">
        <button type="button" data-edit="${p.id}" class="text-brand-600 hover:underline text-xs font-medium">Edit</button>
      </td>
    </tr>`).join('');

    body.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.getAttribute('data-edit')));
    });
  }

  function renderAdjustSelect() {
    const sel = $('adjust-product');
    const current = sel.value;
    sel.innerHTML = state.products
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => `<option value="${p.id}">${escapeHtml(p.name)} (${p.qty} on hand)</option>`)
      .join('');
    if (current && state.products.some((p) => p.id === current)) sel.value = current;
  }

  function renderLow() {
    const list = $('low-list');
    const items = lowProducts().sort((a, b) => a.qty - b.qty);
    if (!items.length) {
      list.innerHTML = '<li class="px-4 py-8 text-center text-slate-400">All products are above reorder levels.</li>';
      return;
    }
    list.innerHTML = items.map((p) => `<li class="px-4 py-4 flex justify-between gap-4 items-center">
      <div>
        <p class="font-medium text-slate-900">${escapeHtml(p.name)}</p>
        <p class="text-xs text-slate-500">${escapeHtml(p.sku)} · ${escapeHtml(p.category)}</p>
      </div>
      <div class="text-right">
        <p class="${qtyClass(p)} text-lg">${p.qty} left</p>
        <p class="text-xs text-slate-400">Reorder at ${p.reorderAt}</p>
      </div>
    </li>`).join('');
  }

  function renderAll() {
    renderStats();
    renderActivity();
    renderProducts();
    renderAdjustSelect();
    renderLow();
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function uid(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function openModal(id) {
    $('modal').classList.remove('hidden');
    if (id) {
      const p = state.products.find((x) => x.id === id);
      if (!p) return;
      $('modal-title').textContent = 'Edit product';
      $('product-id').value = p.id;
      $('p-sku').value = p.sku;
      $('p-name').value = p.name;
      $('p-category').value = p.category;
      $('p-qty').value = p.qty;
      $('p-price').value = p.price;
      $('p-reorder').value = p.reorderAt;
    } else {
      $('modal-title').textContent = 'Add product';
      $('product-form').reset();
      $('product-id').value = '';
      $('p-qty').value = '0';
      $('p-price').value = '0';
      $('p-reorder').value = '5';
    }
  }

  function closeModal() {
    $('modal').classList.add('hidden');
  }

  // Tabs
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll(`.tab-btn[data-tab="${tab}"]`).forEach((b) => b.classList.add('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.add('hidden'));
      const panel = $('tab-' + tab);
      if (panel) panel.classList.remove('hidden');
      if (tab === 'settings') renderThemePicker();
    });
  });

  $('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('email').value.trim();
    const pass = $('password').value;
    if (email === DEMO_EMAIL && pass === DEMO_PASS) {
      sessionStorage.setItem(AUTH_KEY, '1');
      $('login-error').classList.add('hidden');
      showApp();
    } else {
      $('login-error').classList.remove('hidden');
    }
  });

  $('btn-logout').addEventListener('click', () => {
    sessionStorage.removeItem(AUTH_KEY);
    showLogin();
  });

  $('search').addEventListener('input', renderProducts);
  $('btn-add-product').addEventListener('click', () => openModal(null));
  $('modal-cancel').addEventListener('click', closeModal);
  $('modal').addEventListener('click', (e) => {
    if (e.target === $('modal')) closeModal();
  });

  $('btn-reset').addEventListener('click', () => {
    if (confirm('Reset all products and activity to the sample gift shop data?')) {
      state = seedState();
      renderAll();
    }
  });

  $('product-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = $('product-id').value;
    const payload = {
      sku: $('p-sku').value.trim(),
      name: $('p-name').value.trim(),
      category: $('p-category').value,
      qty: Number($('p-qty').value) || 0,
      price: Number($('p-price').value) || 0,
      reorderAt: Number($('p-reorder').value) || 0
    };
    if (id) {
      const i = state.products.findIndex((p) => p.id === id);
      if (i >= 0) state.products[i] = { ...state.products[i], ...payload };
    } else {
      state.products.push({ id: uid('p'), ...payload });
    }
    saveState(state);
    closeModal();
    renderAll();
  });

  $('adjust-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = $('adjust-product').value;
    const type = $('adjust-type').value;
    const qty = Number($('adjust-qty').value);
    const note = $('adjust-note').value.trim();
    const p = state.products.find((x) => x.id === id);
    if (!p || qty < 0) return;

    if (type === 'in') p.qty += qty;
    else if (type === 'out') p.qty = Math.max(0, p.qty - qty);
    else p.qty = qty;

    state.activity.push({
      id: uid('a'),
      at: Date.now(),
      productId: p.id,
      label: p.name,
      type,
      qty,
      note
    });
    saveState(state);
    renderAll();
    $('adjust-note').value = '';
    const msg = $('adjust-msg');
    msg.textContent = 'Adjustment saved. ' + p.name + ' is now at ' + p.qty + '.';
    msg.classList.remove('hidden');
    setTimeout(() => msg.classList.add('hidden'), 3000);
  });

  applyTheme(getTheme());

  if (isLoggedIn()) showApp();
  else showLogin();
})();
