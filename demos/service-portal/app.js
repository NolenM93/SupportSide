(function () {
  const STORAGE_KEY = 'supportside_serviceportal_v1';
  const AUTH_KEY    = 'supportside_serviceportal_auth';
  const THEME_KEY  = 'supportside_serviceportal_theme';

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
      desc: 'Cool teal tones for a professional service brand.',
      swatches: ['#0e4d5c', '#0891b2', '#ecfeff', '#ffffff']
    },
    {
      id: 'forest',
      name: 'Forest',
      desc: 'Green and earthy — solid for outdoor / home services.',
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

  /* ---------- state / auth ---------- */

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedState();
    try { return JSON.parse(raw); } catch { return seedState(); }
  }

  function seedState() {
    const s = window.SERVICEDEMO_SEED;
    const state = {
      clients:  s.clients.map(c => ({ ...c })),
      jobs:     s.jobs.map(j => ({ ...j, history: j.history.map(h => ({ ...h })), documents: j.documents.map(d => ({ ...d })) }))
    };
    saveState(state);
    return state;
  }

  function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

  let state = loadState();
  let session = null; // { userId, role, name, clientId? }

  function getAccounts() { return window.SERVICEDEMO_SEED.accounts; }

  function login(email, pass) {
    const acc = getAccounts().find(a => a.email === email && a.password === pass);
    if (!acc) return false;
    session = { userId: acc.id, role: acc.role, name: acc.name, clientId: acc.clientId || null };
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return true;
  }

  function restoreSession() {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    try { session = JSON.parse(raw); return true; } catch { return false; }
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    session = null;
  }

  /* ---------- filtering ---------- */

  function visibleJobs() {
    if (session.role === 'staff') return state.jobs;
    return state.jobs.filter(j => j.clientId === session.clientId);
  }

  function clientName(id) {
    const c = state.clients.find(c => c.id === id);
    return c ? c.name : 'Unknown';
  }

  /* ---------- helpers ---------- */

  function esc(s) {
    return String(s || '')
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

  function today() { return new Date().toISOString().slice(0,10); }

  function statusBadge(s) {
    const map = { 'Submitted':'badge-submitted','Scheduled':'badge-scheduled','In Progress':'badge-inprogress','Complete':'badge-complete' };
    return `<span class="badge ${map[s] || 'badge-normal'}">${esc(s)}</span>`;
  }

  function priorityBadge(p) {
    const map = { 'Urgent':'badge-urgent','High':'badge-high','Normal':'badge-normal' };
    return `<span class="badge ${map[p] || 'badge-normal'}">${esc(p)}</span>`;
  }

  /* ---------- tabs ---------- */

  function showTab(name) {
    document.querySelectorAll('.tab-panel').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    const panel = $('tab-' + name);
    if (panel) panel.classList.remove('hidden');
    document.querySelectorAll(`[data-tab="${name}"]`).forEach(el => el.classList.add('active'));
    if (name === 'dashboard')   renderDashboard();
    if (name === 'jobs')        renderJobs();
    if (name === 'clients')     renderClients();
    if (name === 'settings')    renderThemePicker();
  }

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.getAttribute('data-tab')));
  });

  /* ---------- render header ---------- */

  function renderHeader() {
    $('header-company').textContent = window.SERVICEDEMO_SEED.companyName;
    $('header-user').textContent = session.name;
    $('header-user').classList.remove('hidden');
    const badge = $('header-role-badge');
    if (session.role === 'staff') {
      badge.textContent = 'Staff';
      badge.className = 'hidden sm:inline text-xs bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full';
    } else {
      badge.textContent = 'Client';
      badge.className = 'hidden sm:inline text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full';
    }
    const clientsTab = $('tab-btn-clients');
    if (session.role === 'staff') clientsTab.classList.remove('hidden');
    else clientsTab.classList.add('hidden');
  }

  /* ---------- dashboard ---------- */

  function renderDashboard() {
    const jobs = visibleJobs();
    $('stat-total').textContent      = String(jobs.length);
    $('stat-open').textContent       = String(jobs.filter(j => j.status === 'Submitted').length);
    $('stat-inprogress').textContent = String(jobs.filter(j => j.status === 'In Progress').length);
    $('stat-complete').textContent   = String(jobs.filter(j => j.status === 'Complete').length);

    const recent = [...jobs].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,5);
    $('dashboard-jobs').innerHTML = recent.length
      ? recent.map(j => jobRowHtml(j)).join('')
      : '<li class="py-4 text-slate-400 text-sm">No jobs yet.</li>';
  }

  function jobRowHtml(j) {
    return `<li class="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer hover:bg-slate-50 -mx-2 px-2 rounded-lg transition-colors" data-open="${j.id}">
      <div class="min-w-0">
        <p class="font-medium text-slate-900 truncate">${esc(j.title)}</p>
        <p class="text-xs text-slate-500">${esc(session.role === 'staff' ? clientName(j.clientId) + ' · ' : '')}${esc(j.type)} · ${esc(j.scheduledDate || 'No date set')}</p>
      </div>
      <div class="flex items-center gap-2 shrink-0">${priorityBadge(j.priority)} ${statusBadge(j.status)}</div>
    </li>`;
  }

  /* ---------- jobs list ---------- */

  function renderJobs() {
    const filter = ($('filter-status').value || '').trim();
    let jobs = visibleJobs();
    if (filter) jobs = jobs.filter(j => j.status === filter);
    jobs = [...jobs].sort((a,b) => {
      const order = { 'Submitted':0, 'In Progress':1, 'Scheduled':2, 'Complete':3 };
      return (order[a.status] ?? 9) - (order[b.status] ?? 9) || b.createdAt.localeCompare(a.createdAt);
    });

    const list = $('jobs-list');
    if (!jobs.length) {
      list.innerHTML = '<p class="text-slate-400 text-sm py-4">No jobs match.</p>';
      return;
    }
    list.innerHTML = jobs.map(j => `
      <div class="bg-white rounded-2xl border border-slate-200 p-5 cursor-pointer hover:border-brand-200 hover:shadow-sm transition-all" data-open="${j.id}">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="font-semibold text-slate-900">${esc(j.title)}</p>
            <p class="text-sm text-slate-500 mt-0.5">${session.role === 'staff' ? esc(clientName(j.clientId)) + ' · ' : ''}${esc(j.type)}</p>
            <p class="text-sm text-slate-400 mt-1 line-clamp-2">${esc(j.description)}</p>
          </div>
          <div class="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
            ${statusBadge(j.status)}
            ${priorityBadge(j.priority)}
          </div>
        </div>
        <div class="flex items-center gap-3 mt-3 text-xs text-slate-400">
          <span>Submitted ${esc(j.createdAt)}</span>
          ${j.scheduledDate ? `<span>· Scheduled ${esc(j.scheduledDate)}</span>` : ''}
          <span>· ${j.documents.length} doc${j.documents.length !== 1 ? 's' : ''}</span>
        </div>
      </div>`).join('');

    list.querySelectorAll('[data-open]').forEach(el => {
      el.addEventListener('click', () => openJobDetail(el.getAttribute('data-open')));
    });
  }

  /* ---------- job detail ---------- */

  function openJobDetail(id) {
    const j = state.jobs.find(x => x.id === id);
    if (!j) return;
    renderJobDetail(j);
    showTab('job-detail');
  }

  function renderJobDetail(j) {
    const isStaff = session.role === 'staff';
    $('job-detail-body').innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900">${esc(j.title)}</h2>
          <p class="text-sm text-slate-500 mt-1">${isStaff ? esc(clientName(j.clientId)) + ' · ' : ''}${esc(j.type)}</p>
        </div>
        <div class="flex items-center gap-2">
          ${priorityBadge(j.priority)} ${statusBadge(j.status)}
          ${isStaff ? `<button data-update="${j.id}" class="ml-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">Update status</button>` : ''}
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-6">

        <div class="space-y-5">
          <div class="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 class="font-semibold text-slate-900 mb-2">Description</h3>
            <p class="text-sm text-slate-600 leading-relaxed">${esc(j.description) || '<em class="text-slate-400">No description.</em>'}</p>
            <div class="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div><span class="font-medium text-slate-700">Submitted:</span> ${esc(j.createdAt)}</div>
              <div><span class="font-medium text-slate-700">Scheduled:</span> ${j.scheduledDate ? esc(j.scheduledDate) : 'TBD'}</div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 class="font-semibold text-slate-900 mb-4">Documents</h3>
            ${j.documents.length
              ? `<ul class="divide-y divide-slate-100">${j.documents.map(d => `
                  <li class="py-2.5 flex items-center justify-between gap-2">
                    <div class="flex items-center gap-2 min-w-0">
                      <svg class="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
                      </svg>
                      <span class="text-sm text-slate-700 truncate">${esc(d.name)}</span>
                    </div>
                    <span class="text-xs text-slate-400 shrink-0">${esc(d.addedAt)}</span>
                  </li>`).join('')}</ul>`
              : '<p class="text-sm text-slate-400">No documents yet.</p>'
            }
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5">
          <h3 class="font-semibold text-slate-900 mb-4">Status history</h3>
          <ol class="space-y-4">
            ${[...j.history].reverse().map((h, i) => `
              <li class="relative pl-5 timeline-item">
                <div class="absolute left-0 top-1 w-3.5 h-3.5 rounded-full border-2 ${i === 0 ? 'border-brand-600 bg-brand-100' : 'border-slate-300 bg-white'}"></div>
                <p class="text-sm font-semibold text-slate-900">${esc(h.label)}</p>
                ${h.note ? `<p class="text-sm text-slate-500 mt-0.5">${esc(h.note)}</p>` : ''}
                <p class="text-xs text-slate-400 mt-0.5">${esc(h.at)}</p>
              </li>`).join('')}
          </ol>
        </div>

      </div>`;

    $('job-detail-body').querySelectorAll('[data-update]').forEach(btn => {
      btn.addEventListener('click', () => openStatusModal(btn.getAttribute('data-update')));
    });
  }

  /* ---------- clients ---------- */

  function renderClients() {
    $('clients-list').innerHTML = state.clients.map(c => {
      const jobs = state.jobs.filter(j => j.clientId === c.id);
      const open = jobs.filter(j => j.status !== 'Complete').length;
      return `<div class="bg-white rounded-2xl border border-slate-200 p-5">
        <div class="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-sm mb-3">${esc(c.name[0])}</div>
        <h3 class="font-bold text-slate-900">${esc(c.name)}</h3>
        <p class="text-sm text-slate-500 mt-0.5">${esc(c.address)}</p>
        <p class="text-sm text-slate-500">${esc(c.phone)}</p>
        <div class="mt-3 pt-3 border-t border-slate-100 flex gap-3 text-xs text-slate-500">
          <span>${jobs.length} job${jobs.length !== 1 ? 's' : ''}</span>
          <span>${open} open</span>
        </div>
      </div>`;
    }).join('');
  }

  /* ---------- modals ---------- */

  function openStatusModal(jobId) {
    const j = state.jobs.find(x => x.id === jobId);
    if (!j) return;
    $('status-job-id').value = jobId;
    $('status-val').value = j.status;
    $('status-note').value = '';
    $('modal-status').classList.remove('hidden');
  }

  $('modal-status-cancel').addEventListener('click', () => $('modal-status').classList.add('hidden'));
  $('modal-status').addEventListener('click', e => { if (e.target === $('modal-status')) $('modal-status').classList.add('hidden'); });

  $('status-form').addEventListener('submit', e => {
    e.preventDefault();
    const id   = $('status-job-id').value;
    const val  = $('status-val').value;
    const note = $('status-note').value.trim();
    const j    = state.jobs.find(x => x.id === id);
    if (!j) return;
    j.status = val;
    j.history.push({ at: today(), label: val, note });
    saveState(state);
    $('modal-status').classList.add('hidden');
    renderJobDetail(j);
    renderDashboard();
  });

  // New job modal
  $('btn-new-job').addEventListener('click', () => {
    $('new-job-form').reset();
    const wrap = $('nj-client-wrap');
    if (session.role === 'staff') {
      wrap.classList.remove('hidden');
      $('nj-client').innerHTML = state.clients.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
    } else {
      wrap.classList.add('hidden');
    }
    $('modal-job').classList.remove('hidden');
  });

  $('modal-job-cancel').addEventListener('click', () => $('modal-job').classList.add('hidden'));
  $('modal-job').addEventListener('click', e => { if (e.target === $('modal-job')) $('modal-job').classList.add('hidden'); });

  $('new-job-form').addEventListener('submit', e => {
    e.preventDefault();
    const clientId = session.role === 'staff' ? $('nj-client').value : session.clientId;
    const j = {
      id: uid('j'),
      clientId,
      title:       $('nj-title').value.trim(),
      type:        $('nj-type').value,
      status:      'Submitted',
      priority:    $('nj-priority').value,
      description: $('nj-desc').value.trim(),
      scheduledDate: null,
      createdAt:   today(),
      history:     [{ at: today(), label: 'Job submitted', note: 'Submitted via portal.' }],
      documents:   []
    };
    state.jobs.unshift(j);
    saveState(state);
    $('modal-job').classList.add('hidden');
    showTab('jobs');
  });

  $('filter-status').addEventListener('change', renderJobs);

  $('back-to-jobs').addEventListener('click', () => showTab('jobs'));

  // Dashboard "view all" link + row clicks
  document.getElementById('tab-dashboard').addEventListener('click', e => {
    const el = e.target.closest('[data-open]');
    if (el) openJobDetail(el.getAttribute('data-open'));
  });

  $('btn-logout').addEventListener('click', () => { logout(); showLogin(); });

  /* ---------- views ---------- */

  function showApp() {
    $('view-login').classList.add('hidden');
    $('view-app').classList.remove('hidden');
    renderHeader();
    showTab('dashboard');
    renderThemePicker();
    if (window.ServicePortalTour) window.ServicePortalTour.start();
  }

  function showLogin() {
    $('view-app').classList.add('hidden');
    $('view-login').classList.remove('hidden');
    if (window.ServicePortalTour) window.ServicePortalTour.stop();
  }

  $('login-form').addEventListener('submit', e => {
    e.preventDefault();
    if (login($('login-email').value.trim(), $('login-password').value)) {
      $('login-error').classList.add('hidden');
      showApp();
    } else {
      $('login-error').classList.remove('hidden');
    }
  });

  applyTheme(getTheme());

  if (restoreSession()) showApp();
  else showLogin();
})();
