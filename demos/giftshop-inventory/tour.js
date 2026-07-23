/**
 * Interactive "features we can add" tour for the Gift Shop Inventory demo.
 */
(function () {
  const DISMISS_KEY = 'supportside_giftshop_tour_dismissed';
  const CONTACT_HREF = '../../index.html#contact';

  const FEATURES = [
    {
      id: 'barcode',
      tab: 'adjust',
      anchor: 'hotspot-adjust',
      icon: 'scan',
      title: 'Barcode & QR scanning',
      tagline: 'Receive and count stock in seconds',
      body: 'Point a phone camera or USB scanner at a barcode to receive shipments, pull items for sale, or run cycle counts — no typing SKUs.',
      bullets: [
        'Scan to stock-in from supplier boxes',
        'Mobile-friendly camera scanning on the floor',
        'Fewer typos than manual qty entry'
      ],
      why: 'Gift shops move dozens of SKUs a day. Scanning cuts receiving time dramatically and keeps counts accurate.'
    },
    {
      id: 'alerts',
      tab: 'low',
      anchor: 'hotspot-low',
      icon: 'bell',
      title: 'Automatic low-stock alerts',
      tagline: 'Know before you sell out',
      body: 'When qty hits the reorder level, the system texts or emails you (and your supplier list) so popular candles and seasonal items get reordered before the shelf goes empty.',
      bullets: [
        'SMS or email when stock crosses the threshold',
        'Optional weekly “what to reorder” digest',
        'Per-product supplier contact hooks'
      ],
      why: 'Most stockouts happen because nobody checked the spreadsheet. Alerts make replenishment automatic.'
    },
    {
      id: 'locations',
      tab: 'dashboard',
      anchor: 'hotspot-stats',
      icon: 'map',
      title: 'Multi-location inventory',
      tagline: 'Storefront, back room, and market booth',
      body: 'Track the same SKU across locations — main shop, storage, pop-up markets — with transfer history between them.',
      bullets: [
        'Per-location quantities on one product',
        'Transfer stock between sites in two taps',
        'Location-specific low-stock rules'
      ],
      why: 'Retailers with more than one selling spot stop guessing which shelf still has inventory.'
    },
    {
      id: 'purchase-orders',
      tab: 'products',
      anchor: 'hotspot-products',
      icon: 'truck',
      title: 'Purchase orders & suppliers',
      tagline: 'Reorder with a paper trail',
      body: 'Build POs from low-stock items, email them to vendors, then receive against the order so expected vs. actual qty is always clear.',
      bullets: [
        'One-click “create PO from low stock”',
        'Supplier contacts and lead times',
        'Partial receiving with discrepancy notes'
      ],
      why: 'Turns “I think we ordered that” into a trackable workflow your accountant will like too.'
    },
    {
      id: 'analytics',
      tab: 'dashboard',
      anchor: 'hotspot-activity',
      icon: 'chart',
      title: 'Sales velocity & reports',
      tagline: 'See what actually sells',
      body: 'Dashboards for top movers, dead stock, margin by category, and seasonal trends — exportable for your bookkeeper or tax prep.',
      bullets: [
        'Best / worst sellers by week or season',
        'Category margin snapshots',
        'CSV / PDF export for your accountant'
      ],
      why: 'Buying decisions stop being gut feel. You stock what turns and clear what sits.'
    },
    {
      id: 'pos',
      tab: 'adjust',
      anchor: 'hotspot-adjust-form',
      icon: 'pos',
      title: 'POS & Shopify sync',
      tagline: 'Sell once, inventory updates everywhere',
      body: 'Connect Square, Shopify, or a custom POS so every sale deducts stock automatically — no end-of-day spreadsheet reconciliation.',
      bullets: [
        'Realtime stock sync from sales',
        'Online + in-store inventory in one place',
        'Fewer “sold out online / still on shelf” mismatches'
      ],
      why: 'Manual stock-outs after each sale don’t scale. Sync does.'
    },
    {
      id: 'photos',
      tab: 'products',
      anchor: 'hotspot-add-product',
      icon: 'photo',
      title: 'Product photo catalog',
      tagline: 'Visual inventory your staff can recognize',
      body: 'Attach photos (and optional variants) so part-time staff find the right SKU fast — and you have assets ready for social or an online catalog.',
      bullets: [
        'Phone photo upload per product',
        'Variant images (color, scent, size)',
        'Reusable for web / Instagram listings'
      ],
      why: 'When you have 200+ similar items, a photo beats a SKU string every time.'
    },
    {
      id: 'roles',
      tab: 'dashboard',
      anchor: 'hotspot-header',
      icon: 'users',
      title: 'Staff roles & permissions',
      tagline: 'Owner vs. cashier vs. stocker',
      body: 'Give cashiers adjust-only access, let managers edit prices, and keep cost / vendor data owner-only — with an audit log of who changed what.',
      bullets: [
        'Role-based screens and actions',
        'Full audit trail on qty and price changes',
        'Works for multi-employee shops'
      ],
      why: 'Shared logins are a liability. Proper roles protect your numbers and your margins.'
    }
  ];

  const ICONS = {
    scan: '<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 4.5v15m16.5-15v15M7.5 4.5h1.5m6 0h1.5M7.5 19.5h1.5m6 0h1.5M9 9h6v6H9V9z"/>',
    bell: '<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"/>',
    map: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/>',
    truck: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.038v-.591a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v.591m12 0A2.25 2.25 0 0118 10.5h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"/>',
    chart: '<path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/>',
    pos: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/>',
    photo: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"/>',
    users: '<path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>'
  };

  function iconSvg(key) {
    return `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">${ICONS[key] || ICONS.scan}</svg>`;
  }

  function $(id) { return document.getElementById(id); }

  function featureById(id) {
    return FEATURES.find((f) => f.id === id);
  }

  function activateTab(tab) {
    if (!tab) return;
    const btn = document.querySelector(`.tab-btn[data-tab="${tab}"]`);
    if (btn) btn.click();
  }

  function openFeature(id) {
    const f = featureById(id);
    if (!f) return;
    activateTab(f.tab);
    const modal = $('feature-modal');
    $('feature-modal-icon').innerHTML = iconSvg(f.icon);
    $('feature-modal-title').textContent = f.title;
    $('feature-modal-tagline').textContent = f.tagline;
    $('feature-modal-body').textContent = f.body;
    $('feature-modal-why').textContent = f.why;
    $('feature-modal-bullets').innerHTML = f.bullets.map((b) => `<li>${b}</li>`).join('');
    $('feature-modal-cta').href = CONTACT_HREF;
    modal.classList.remove('hidden');
    document.body.classList.add('tour-modal-open');
    highlightHotspot(f.anchor);
    markSeen(id);
  }

  function closeFeature() {
    $('feature-modal').classList.add('hidden');
    document.body.classList.remove('tour-modal-open');
    clearHighlight();
  }

  function openGallery() {
    const grid = $('feature-gallery-grid');
    grid.innerHTML = FEATURES.map((f) => `
      <button type="button" class="feature-gallery-card" data-feature="${f.id}">
        <span class="feature-gallery-icon">${iconSvg(f.icon)}</span>
        <span class="feature-gallery-text">
          <span class="feature-gallery-title">${f.title}</span>
          <span class="feature-gallery-tag">${f.tagline}</span>
        </span>
        <span class="feature-gallery-arrow">→</span>
      </button>`).join('');
    grid.querySelectorAll('[data-feature]').forEach((btn) => {
      btn.addEventListener('click', () => {
        closeGallery();
        openFeature(btn.getAttribute('data-feature'));
      });
    });
    $('feature-gallery').classList.remove('hidden');
    document.body.classList.add('tour-modal-open');
  }

  function closeGallery() {
    $('feature-gallery').classList.add('hidden');
    if ($('feature-modal').classList.contains('hidden')) {
      document.body.classList.remove('tour-modal-open');
    }
  }

  function highlightHotspot(anchorId) {
    clearHighlight();
    const el = document.getElementById(anchorId);
    if (el) el.classList.add('tour-hotspot--focus');
  }

  function clearHighlight() {
    document.querySelectorAll('.tour-hotspot--focus').forEach((el) => el.classList.remove('tour-hotspot--focus'));
  }

  function markSeen(id) {
    const btn = document.querySelector(`.tour-hotspot[data-feature="${id}"]`);
    if (btn) btn.classList.add('tour-hotspot--seen');
  }

  function showWelcome() {
    if (sessionStorage.getItem(DISMISS_KEY) === '1') return;
    $('tour-welcome').classList.remove('hidden');
  }

  function dismissWelcome(persist) {
    $('tour-welcome').classList.add('hidden');
    if (persist) sessionStorage.setItem(DISMISS_KEY, '1');
  }

  function showTourChrome() {
    $('tour-fab').classList.remove('hidden');
    document.querySelectorAll('.tour-hotspot').forEach((el) => el.classList.remove('hidden'));
    showWelcome();
  }

  function hideTourChrome() {
    $('tour-fab').classList.add('hidden');
    $('tour-welcome').classList.add('hidden');
    closeFeature();
    closeGallery();
    document.querySelectorAll('.tour-hotspot').forEach((el) => el.classList.add('hidden'));
  }

  function bind() {
    document.querySelectorAll('.tour-hotspot').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openFeature(btn.getAttribute('data-feature'));
      });
    });

    $('tour-fab').addEventListener('click', openGallery);
    $('feature-gallery-close').addEventListener('click', closeGallery);
    $('feature-gallery').addEventListener('click', (e) => {
      if (e.target === $('feature-gallery')) closeGallery();
    });

    $('feature-modal-close').addEventListener('click', closeFeature);
    $('feature-modal').addEventListener('click', (e) => {
      if (e.target === $('feature-modal')) closeFeature();
    });

    $('tour-welcome-explore').addEventListener('click', () => {
      dismissWelcome(false);
      openGallery();
    });
    $('tour-welcome-dismiss').addEventListener('click', () => dismissWelcome(true));

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (!$('feature-modal').classList.contains('hidden')) closeFeature();
      else if (!$('feature-gallery').classList.contains('hidden')) closeGallery();
    });
  }

  // Public hooks used by app.js
  window.GiftshopTour = {
    start: showTourChrome,
    stop: hideTourChrome,
    open: openFeature,
    openGallery
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
})();
