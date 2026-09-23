import type { AppSpec, Accent } from "@/lib/ai/spec";
import type { FileTree } from "@/lib/types";

const ACCENT: Record<Accent, string> = {
  blue: "#0a84ff",
  teal: "#00c7be",
  orange: "#ff9f0a",
  purple: "#bf5af2",
  green: "#30d158",
};

function cssFor(spec: AppSpec) {
  const dark = spec.theme === "dark";
  const accent = ACCENT[spec.accent];
  return `
:root {
  --bg: ${dark ? "#000000" : "#f2f2f7"};
  --card: ${dark ? "#1c1c1e" : "#ffffff"};
  --ink: ${dark ? "#f5f5f7" : "#1c1c1e"};
  --muted: ${dark ? "rgba(235,235,245,0.55)" : "#8e8e93"};
  --line: ${dark ? "rgba(84,84,88,0.55)" : "rgba(60,60,67,0.12)"};
  --accent: ${accent};
  --shadow: ${dark ? "none" : "0 8px 30px rgba(15,23,42,0.08)"};
  --radius: 18px;
  --font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif;
  --tab: ${dark ? "rgba(28,28,30,0.92)" : "rgba(255,255,255,0.92)"};
}
* { box-sizing: border-box; }
html, body { margin: 0; min-height: 100%; }
body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--ink);
  -webkit-font-smoothing: antialiased;
}
.app {
  max-width: 430px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 18px 16px 96px;
}
.kicker {
  color: var(--muted);
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
h1 { font-size: 32px; letter-spacing: -0.045em; margin: 2px 0 0; }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 16px 0 14px; }
.stat {
  background: var(--card);
  border-radius: 14px;
  padding: 12px 10px;
  box-shadow: var(--shadow);
}
.stat b { display: block; font-size: 20px; letter-spacing: -0.03em; }
.stat span { color: var(--muted); font-size: 11px; font-weight: 600; }
.search {
  width: 100%;
  border: 0;
  background: ${dark ? "#2c2c2e" : "rgba(118,118,128,0.12)"};
  color: var(--ink);
  border-radius: 12px;
  padding: 10px 12px;
  font: inherit;
  margin-bottom: 12px;
}
.list { display: flex; flex-direction: column; gap: 10px; }
.card {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 14px;
}
.row { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.muted { color: var(--muted); font-size: 13px; margin-top: 3px; }
.pill {
  flex-shrink: 0;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 700;
  background: color-mix(in srgb, var(--accent) 16%, transparent);
  color: var(--accent);
}
.pill.hold { background: rgba(255,159,10,0.16); color: #d88700; }
.pill.ok { background: rgba(48,209,88,0.16); color: #248a3d; }
.btn {
  appearance: none; border: 0; border-radius: 12px;
  background: var(--accent); color: #fff; font-weight: 650;
  padding: 10px 12px; font-size: 14px; cursor: pointer;
}
.btn.ghost {
  background: color-mix(in srgb, var(--accent) 14%, transparent);
  color: var(--accent);
}
.btn.small { padding: 7px 10px; font-size: 12px; border-radius: 10px; }
.field { margin-bottom: 10px; }
label { display: block; font-size: 12px; font-weight: 650; color: var(--muted); margin-bottom: 6px; }
input, select {
  width: 100%; border: 1px solid var(--line); border-radius: 12px;
  padding: 10px 12px; font: inherit; background: var(--card); color: var(--ink);
}
.panel { display: none; }
.panel.on { display: block; }
.tabbar {
  position: fixed; left: 50%; bottom: 0; transform: translateX(-50%);
  width: 100%; max-width: 430px;
  display: grid; grid-template-columns: repeat(3, 1fr);
  background: var(--tab);
  backdrop-filter: blur(16px);
  border-top: 0.5px solid var(--line);
  padding: 8px 8px 14px;
}
.tabbar button {
  border: 0; background: transparent; color: var(--muted);
  font-size: 10px; font-weight: 650; padding: 4px;
}
.tabbar button.on { color: var(--accent); }
.empty { text-align: center; color: var(--muted); padding: 28px 8px; }
`;
}

function jsFor(spec: AppSpec) {
  return `const SPEC = ${JSON.stringify(spec)};
const KEY = "studio-app-" + SPEC.kind;
const tones = { ok: "ok", hold: "hold", done: "" };

function loadItems() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (Array.isArray(saved) && saved.length) return saved;
  } catch (e) {}
  return SPEC.items.slice();
}

let items = loadItems();
let tab = "home";

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {}
}

function el(id) { return document.getElementById(id); }

function pillClass(tone) {
  return "pill" + (tone === "hold" ? " hold" : tone === "ok" ? " ok" : "");
}

function renderStats() {
  el("stats").innerHTML = SPEC.stats.map(function (s) {
    return '<div class="stat"><b>' + s.value + "</b><span>" + s.label + "</span></div>";
  }).join("");
}

function renderList() {
  const q = ((el("search") && el("search").value) || "").toLowerCase();
  const shown = items.filter(function (item) {
    return (item.title + " " + item.subtitle).toLowerCase().indexOf(q) !== -1;
  });
  el("list").innerHTML = shown.length
    ? shown.map(function (item, i) {
        return '<article class="card"><div class="row"><div><strong>' + item.title +
          '</strong><div class="muted">' + item.subtitle + '</div></div><span class="' +
          pillClass(item.tone) + '">' + item.badge +
          '</span></div><button class="btn ghost small" style="margin-top:10px" data-i="' + i +
          '">' + SPEC.primaryAction + "</button></article>";
      }).join("")
    : '<p class="empty">Nothing matches.</p>';
}

function setTab(next) {
  tab = next;
  ["home", "add", "more"].forEach(function (id) {
    el("panel-" + id).classList.toggle("on", id === next);
    el("tab-" + id).classList.toggle("on", id === next);
  });
}

el("brand-kicker").textContent = SPEC.kicker;
el("brand-title").textContent = SPEC.name;
document.title = SPEC.name;
if (!SPEC.search) el("search").style.display = "none";
el("add-title").textContent = SPEC.formTitle;
el("submit-add").textContent = SPEC.addLabel;
el("more-copy").textContent = "This is a live preview of " + SPEC.name + ". Tap items to update them.";

renderStats();
renderList();

el("search").addEventListener("input", renderList);
el("list").addEventListener("click", function (e) {
  const btn = e.target.closest("button[data-i]");
  if (!btn) return;
  const item = items[Number(btn.getAttribute("data-i"))];
  if (!item) return;
  if (SPEC.kind === "inventory") {
    item.badge = "Updated";
    item.tone = "ok";
  } else if (SPEC.kind === "jobs") {
    const flow = ["Queued", "En route", "On site", "Done"];
    const i = flow.indexOf(item.badge);
    item.badge = flow[Math.min(flow.length - 1, Math.max(0, i) + 1)];
    item.tone = item.badge === "Done" ? "ok" : item.badge === "Queued" ? "hold" : "done";
  } else {
    item.badge = SPEC.primaryAction;
    item.tone = "done";
  }
  save();
  renderList();
});

el("submit-add").addEventListener("click", function () {
  const title = el("f-title").value.trim() || "Untitled";
  const subtitle = el("f-sub").value.trim() || "Added from the app";
  items.unshift({ title: title, subtitle: subtitle, badge: "New", tone: "hold" });
  el("f-title").value = "";
  el("f-sub").value = "";
  save();
  renderList();
  setTab("home");
});

el("tab-home").onclick = function () { setTab("home"); };
el("tab-add").onclick = function () { setTab("add"); };
el("tab-more").onclick = function () { setTab("more"); };
`;
}

export function renderApp(spec: AppSpec): FileTree {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${spec.name}</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <main class="app">
    <div>
      <div class="kicker" id="brand-kicker"></div>
      <h1 id="brand-title"></h1>
    </div>
    <div class="stats" id="stats"></div>
    <section id="panel-home" class="panel on">
      <input class="search" id="search" placeholder="Search" />
      <div class="list" id="list"></div>
    </section>
    <section id="panel-add" class="panel">
      <article class="card">
        <h1 id="add-title" style="font-size:22px;margin-bottom:12px"></h1>
        <div class="field"><label>Name</label><input id="f-title" placeholder="Name" /></div>
        <div class="field"><label>Details</label><input id="f-sub" placeholder="Notes" /></div>
        <button class="btn" id="submit-add" type="button">Save</button>
      </article>
    </section>
    <section id="panel-more" class="panel">
      <article class="card">
        <p class="muted" id="more-copy"></p>
      </article>
    </section>
  </main>
  <nav class="tabbar">
    <button type="button" class="on" id="tab-home">Home</button>
    <button type="button" id="tab-add">New</button>
    <button type="button" id="tab-more">More</button>
  </nav>
  <script src="app.js"></script>
</body>
</html>`;

  return {
    "spec.json": JSON.stringify(spec, null, 2),
    "index.html": html,
    "styles.css": cssFor(spec),
    "app.js": jsFor(spec),
  };
}

export function describeSpec(spec: AppSpec, iterating: boolean) {
  const theme = spec.theme === "dark" ? "dark" : "light";
  if (iterating) {
    return `Updated ${spec.name}: ${theme} ${spec.kind} app with ${spec.items.length} live records. Try Home, New, and the action on each card.`;
  }
  return `Built ${spec.name} — a ${theme} ${spec.kind} app with today's sample work, search, and a New tab so you can add records.`;
}
