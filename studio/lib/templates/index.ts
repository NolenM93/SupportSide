import type { FileTree, TemplateId } from "@/lib/types";
import { kindFromTemplate, nameFromPrompt } from "@/lib/ai/spec";
import { appShellCss } from "@/lib/templates/shared";

export const TEMPLATES: {
  id: TemplateId;
  name: string;
  blurb: string;
}[] = [
  { id: "blank", name: "Blank app", blurb: "Start from a clean iOS-style shell." },
  { id: "inventory", name: "Inventory", blurb: "Products, stock in/out, low-stock alerts." },
  { id: "portal", name: "Job portal", blurb: "Requests, status timeline, customer updates." },
  { id: "booking", name: "Booking", blurb: "Availability, reservations, and check-in." },
];

function page(title: string, body: string, extraHead = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <link rel="stylesheet" href="styles.css" />
  ${extraHead}
</head>
<body>
  ${body}
  <script src="app.js"></script>
</body>
</html>`;
}

export function getTemplateFiles(id: TemplateId): FileTree {
  switch (id) {
    case "inventory":
      return inventoryFiles();
    case "portal":
      return portalFiles();
    case "booking":
      return bookingFiles();
    default:
      return blankFiles();
  }
}

function blankFiles(): FileTree {
  return {
    "index.html": page(
      "New app",
      `<main class="app">
        <div class="topbar">
          <div>
            <div class="kicker">Support Side Studio</div>
            <h1>Your app</h1>
          </div>
        </div>
        <section class="card">
          <p class="muted">Describe what this app should do. Inventory, jobs, booking, a client portal — the next prompt will shape this screen.</p>
        </section>
      </main>`,
    ),
    "styles.css": appShellCss,
    "app.js": `console.log("Studio blank app ready");`,
  };
}

function inventoryFiles(): FileTree {
  return {
    "index.html": page(
      "Inventory",
      `<main class="app">
        <div class="topbar">
          <div>
            <div class="kicker">Operations</div>
            <h1>Inventory</h1>
          </div>
          <button class="btn small" id="addBtn">Add</button>
        </div>
        <input class="search" id="search" placeholder="Search products" />
        <div id="low"></div>
        <div class="list" id="list"></div>
        <section class="card" id="formCard" hidden>
          <div class="field"><label>Name</label><input id="name" /></div>
          <div class="field"><label>SKU</label><input id="sku" /></div>
          <div class="field"><label>Qty</label><input id="qty" type="number" value="0" /></div>
          <button class="btn" id="saveBtn">Save product</button>
        </section>
      </main>`,
    ),
    "styles.css": appShellCss,
    "app.js": `const KEY = "studio-inventory";
const seed = [
  { id: "1", name: "Ceramic mug", sku: "MUG-01", qty: 12 },
  { id: "2", name: "Gift wrap roll", sku: "WRP-04", qty: 3 },
  { id: "3", name: "Ribbon set", sku: "RIB-12", qty: 18 }
];
function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || seed; } catch (e) { return seed; }
}
function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }
let items = load();
const list = document.getElementById("list");
const search = document.getElementById("search");
const formCard = document.getElementById("formCard");
function render() {
  const q = (search.value || "").toLowerCase();
  const shown = items.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  const low = items.filter((p) => p.qty <= 5);
  document.getElementById("low").innerHTML = low.length
    ? '<div class="card"><span class="pill hold">' + low.length + ' low stock</span></div>'
    : "";
  list.innerHTML = shown.map((p) =>
    '<article class="card"><div class="row"><div><strong>' + p.name + '</strong><div class="muted">' + p.sku + '</div></div><span class="pill ' + (p.qty <= 5 ? "hold" : "") + '">' + p.qty + ' in stock</span></div><div class="row" style="margin-top:10px"><button class="btn ghost small" data-id="' + p.id + '" data-d="-1">Stock out</button><button class="btn small" data-id="' + p.id + '" data-d="1">Stock in</button></div></article>'
  ).join("") || '<p class="empty">No products match.</p>';
}
list.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const item = items.find((p) => p.id === btn.dataset.id);
  if (!item) return;
  item.qty = Math.max(0, item.qty + Number(btn.dataset.d));
  save(items); render();
});
search.addEventListener("input", render);
document.getElementById("addBtn").onclick = () => { formCard.hidden = !formCard.hidden; };
document.getElementById("saveBtn").onclick = () => {
  items.unshift({
    id: String(Date.now()),
    name: document.getElementById("name").value || "Untitled",
    sku: document.getElementById("sku").value || "SKU",
    qty: Number(document.getElementById("qty").value || 0)
  });
  save(items); formCard.hidden = true; render();
};
render();`,
  };
}

function portalFiles(): FileTree {
  return {
    "index.html": page(
      "Job portal",
      `<main class="app">
        <div class="topbar">
          <div>
            <div class="kicker">Service team</div>
            <h1>Jobs</h1>
          </div>
        </div>
        <section class="card">
          <div class="field"><label>Customer</label><input id="customer" placeholder="Jordan Lee" /></div>
          <div class="field"><label>Request</label><input id="request" placeholder="AC not cooling" /></div>
          <button class="btn" id="createBtn">New request</button>
        </section>
        <div class="list" id="list"></div>
      </main>`,
    ),
    "styles.css": appShellCss,
    "app.js": `const KEY = "studio-portal";
const seed = [
  { id: "101", customer: "Maple Dental", request: "Replace hallway thermostat", status: "In progress" },
  { id: "102", customer: "Harbor Inn", request: "No hot water in unit 4", status: "Queued" }
];
const flow = ["Queued", "In progress", "On site", "Done"];
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || seed; } catch (e) { return seed; } }
function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }
let jobs = load();
const list = document.getElementById("list");
function pill(status) {
  if (status === "Done") return "done";
  if (status === "In progress" || status === "On site") return "hold";
  return "";
}
function render() {
  list.innerHTML = jobs.map((j) =>
    '<article class="card"><div class="row"><div><strong>' + j.customer + '</strong><div class="muted">' + j.request + '</div></div><span class="pill ' + pill(j.status) + '">' + j.status + '</span></div><button class="btn ghost small" style="margin-top:10px" data-id="' + j.id + '">Advance status</button></article>'
  ).join("");
}
list.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const job = jobs.find((j) => j.id === btn.dataset.id);
  if (!job) return;
  const i = flow.indexOf(job.status);
  job.status = flow[Math.min(flow.length - 1, i + 1)];
  save(jobs); render();
});
document.getElementById("createBtn").onclick = () => {
  jobs.unshift({
    id: String(Date.now()),
    customer: document.getElementById("customer").value || "Walk-in",
    request: document.getElementById("request").value || "New request",
    status: "Queued"
  });
  save(jobs); render();
};
render();`,
  };
}

function bookingFiles(): FileTree {
  return {
    "index.html": page(
      "Bookings",
      `<main class="app">
        <div class="topbar">
          <div>
            <div class="kicker">Rentals</div>
            <h1>Book a unit</h1>
          </div>
        </div>
        <div class="list" id="units"></div>
        <section class="card">
          <div class="field"><label>Unit</label><select id="unit"></select></div>
          <div class="field"><label>Date</label><input id="date" type="date" /></div>
          <div class="field"><label>Name</label><input id="name" placeholder="Your name" /></div>
          <button class="btn" id="bookBtn">Reserve</button>
        </section>
        <h2 class="muted" style="margin:18px 4px 8px;font-size:13px;">Upcoming</h2>
        <div class="list" id="reservations"></div>
      </main>`,
    ),
    "styles.css": appShellCss,
    "app.js": `const KEY = "studio-booking";
const units = [
  { id: "u1", name: "Trailer 14ft", ready: true },
  { id: "u2", name: "Scissor lift", ready: true },
  { id: "u3", name: "Party tent", ready: false }
];
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
function save(items) { localStorage.setItem(KEY, JSON.stringify(items)); }
let reservations = load();
const unitSelect = document.getElementById("unit");
unitSelect.innerHTML = units.map((u) => '<option value="' + u.id + '">' + u.name + '</option>').join("");
function render() {
  document.getElementById("units").innerHTML = units.map((u) =>
    '<article class="card row"><div><strong>' + u.name + '</strong><div class="muted">Same-day pickup</div></div><span class="pill ' + (u.ready ? "" : "hold") + '">' + (u.ready ? "Available" : "Hold") + '</span></article>'
  ).join("");
  document.getElementById("reservations").innerHTML = reservations.length
    ? reservations.map((r) => '<article class="card row"><div><strong>' + r.name + '</strong><div class="muted">' + r.unit + ' · ' + r.date + '</div></div><span class="pill done">Reserved</span></article>').join("")
    : '<p class="empty">No reservations yet.</p>';
}
document.getElementById("bookBtn").onclick = () => {
  const unit = units.find((u) => u.id === unitSelect.value);
  reservations.unshift({
    id: String(Date.now()),
    unit: unit ? unit.name : "Unit",
    date: document.getElementById("date").value || "TBD",
    name: document.getElementById("name").value || "Guest"
  });
  save(reservations); render();
};
render();`,
  };
}

export function defaultProjectName(templateId: TemplateId, prompt?: string) {
  if (prompt?.trim()) {
    return nameFromPrompt(prompt, kindFromTemplate(templateId));
  }
  const match = TEMPLATES.find((t) => t.id === templateId);
  return match?.name ?? "Untitled app";
}
