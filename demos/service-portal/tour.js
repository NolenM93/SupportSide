/**
 * Interactive "features we can add" tour for the Service Business Portal demo.
 */
(function () {
  const DISMISS_KEY = 'supportside_serviceportal_tour_dismissed';
  const CONTACT_HREF = '../../index.html#contact';

  const FEATURES = [
    {
      id: 'sms',
      tab: 'jobs',
      anchor: 'hotspot-jobs',
      icon: 'sms',
      title: 'SMS status updates',
      tagline: 'Clients get texts when jobs move',
      body: 'When staff marks a job Scheduled, In Progress, or Complete, the client automatically gets a clear SMS — no phone tag, no “any update?” emails.',
      bullets: [
        'Auto-text on every status change',
        'Custom templates per job type',
        'Optional two-way reply (“reschedule” / “confirm”)'
      ],
      why: 'Service businesses lose hours answering status questions. Automated SMS keeps clients calm and your phone free.'
    },
    {
      id: 'photos',
      tab: 'jobs',
      anchor: 'hotspot-jobs-list',
      icon: 'camera',
      title: 'Field photo uploads',
      tagline: 'Before / after from the truck',
      body: 'Techs snap photos on-site and attach them to the work order. Clients see progress; you keep proof of condition and completed work.',
      bullets: [
        'Mobile upload with compression',
        'Before / after galleries on the job',
        'Visible to client in their portal'
      ],
      why: 'Photos settle disputes, win trust, and make invoices easier to justify.'
    },
    {
      id: 'scheduling',
      tab: 'dashboard',
      anchor: 'hotspot-stats',
      icon: 'calendar',
      title: 'Live scheduling calendar',
      tagline: 'Drag jobs onto tech days',
      body: 'A shared calendar for dispatch — assign techs, set windows, block travel time, and let clients request preferred slots from the portal.',
      bullets: [
        'Drag-and-drop day / week board',
        'Tech capacity and travel buffers',
        'Client self-serve preferred windows'
      ],
      why: 'Spreadsheets and group texts don’t scale past a few trucks. A real schedule does.'
    },
    {
      id: 'invoicing',
      tab: 'jobs',
      anchor: 'hotspot-new-job',
      icon: 'invoice',
      title: 'Invoices & online payments',
      tagline: 'Finish the job, get paid faster',
      body: 'Generate an invoice from the completed work order and collect card or ACH payment in the portal — with receipts emailed automatically.',
      bullets: [
        'Line items from job notes / parts',
        'Stripe / Square payment links',
        'Paid vs. overdue dashboard'
      ],
      why: 'Closing the loop from “job done” to “money in” is where most contractors leak cashflow.'
    },
    {
      id: 'dispatch',
      tab: 'dashboard',
      anchor: 'hotspot-recent',
      icon: 'map',
      title: 'Dispatch map & ETA',
      tagline: 'See where every truck is',
      body: 'Map view of open jobs and optional tech GPS so office staff can route smarter and share ETAs with waiting clients.',
      bullets: [
        'Jobs pinned on a live map',
        'Optional tech location (with consent)',
        'ETA texts to the next client'
      ],
      why: 'Better routing means fewer dead miles and happier customers staring at the clock.'
    },
    {
      id: 'esign',
      tab: 'clients',
      anchor: 'hotspot-clients',
      icon: 'pen',
      title: 'E-signatures on work orders',
      tagline: 'Approve estimates on a phone',
      body: 'Send estimates or completion forms for tap-to-sign. Signed PDFs attach to the job automatically — no printing, scanning, or lost paper.',
      bullets: [
        'Estimate approval from the client portal',
        'Completion / waiver signatures on-site',
        'Signed PDF stored with the job'
      ],
      why: 'Paper slows jobs down. Digital sign-off keeps work moving and creates a clean audit trail.'
    },
    {
      id: 'contracts',
      tab: 'clients',
      anchor: 'hotspot-clients-list',
      icon: 'repeat',
      title: 'Recurring maintenance contracts',
      tagline: 'HVAC tune-ups on autopilot',
      body: 'Set seasonal or quarterly service plans that auto-create jobs, remind the client, and track contract value — perfect for maintenance agreements.',
      bullets: [
        'Auto-generate recurring jobs',
        'Contract start / end and billing cadence',
        'Renewal reminders before expiry'
      ],
      why: 'Recurring revenue is the difference between feast-or-famine and a predictable pipeline.'
    },
    {
      id: 'automation',
      tab: 'dashboard',
      anchor: 'hotspot-header',
      icon: 'bot',
      title: 'Missed-call & AI SMS intake',
      tagline: 'Never lose a lead after hours',
      body: 'Missed calls trigger an SMS that collects name, address, and issue — then opens a portal job for your team. Optional AI FAQ handles common questions.',
      bullets: [
        'Missed-call → SMS conversation',
        'Leads become jobs in the portal',
        'After-hours coverage without a night shift'
      ],
      why: 'Most service leads call once. If you miss it, they call the next company. Automation catches them.'
    }
  ];

  const ICONS = {
    sms: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/>',
    camera: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"/><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z"/>',
    calendar: '<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"/>',
    invoice: '<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"/>',
    map: '<path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z"/>',
    pen: '<path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"/>',
    repeat: '<path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/>',
    bot: '<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z"/>'
  };

  function iconSvg(key) {
    return `<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.75" viewBox="0 0 24 24">${ICONS[key] || ICONS.sms}</svg>`;
  }

  function $(id) { return document.getElementById(id); }

  function featureById(id) {
    return FEATURES.find((f) => f.id === id);
  }

  function activateTab(tab) {
    if (!tab) return;
    // Clients tab is staff-only — fall back to dashboard if hidden
    if (tab === 'clients') {
      const clientsBtn = $('tab-btn-clients');
      if (clientsBtn && clientsBtn.classList.contains('hidden')) {
        tab = 'dashboard';
      }
    }
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

  window.ServicePortalTour = {
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
