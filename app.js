// ---------- Projects ----------
// Descriptions are kept general on purpose: no company names, people, servers or real data.
const PROJECTS = [
  {
    area: "purchasing", icon: "🧾", title: "PO Discrepancy Check",
    text: "Compares each purchase order against the vendor's order confirmation and marks every quantity, unit-cost and extended-cost difference directly on the PO PDF, then adds a summary page.",
    flow: "PO + vendor confirmation → annotated PDF + summary",
    tags: ["PDF", "Email", "Try the demo below"]
  },
  {
    area: "purchasing", icon: "📦", title: "Today's Receiving POs",
    text: "Runs the daily PO status report in our ERP, turns the PDF into a clean, print-ready Excel workbook for the receiving dock and sends it to the printer.",
    flow: "ERP report → formatted Excel → printer",
    tags: ["ERP", "PDF", "Excel"]
  },
  {
    area: "purchasing", icon: "📄", title: "Order Acknowledgment Reformatter",
    text: "Condenses long, multi-page vendor acknowledgment text exports into a compact one-page layout without the repeated headers, and names each file by its PO number.",
    flow: "Raw text export → clean one-page file",
    tags: ["Text files"]
  },
  {
    area: "purchasing", icon: "💲", title: "Discount Deviation Matching",
    text: "Matches a vendor inventory report against that vendor's discount price list, finds every eligible item and builds a workbook of the matches.",
    flow: "Inventory report + price list → match workbook",
    tags: ["Excel", "PDF"]
  },
  {
    area: "inventory", icon: "🚚", title: "Not-On-Truck Adjustments",
    text: "Finds the day's not-on-truck credit register in email, reconciles it into a spreadsheet, then keys each quantity back into inventory in the green-screen terminal.",
    flow: "Email → reconciled sheet → terminal entry",
    tags: ["Email", "Excel", "Terminal"]
  },
  {
    area: "inventory", icon: "✍️", title: "Handwritten Transfer Sheets",
    text: "Reads scanned, handwritten inventory transfer sheets and transcribes every grid into the adjustment workbook, ready to key.",
    flow: "Scanned handwriting → structured Excel",
    tags: ["Scans", "Excel"]
  },
  {
    area: "inventory", icon: "🥩", title: "Meat Room Adjustments",
    text: "Keys meat room adjustments from the worksheet into the terminal using keyboard shortcuts, times the run, and imports the batch into the ERP.",
    flow: "Adjustment sheet → terminal → ERP import",
    tags: ["Terminal", "ERP", "Desktop control"]
  },
  {
    area: "inventory", icon: "🔢", title: "Weekly Final-Count Adjustments",
    text: "Picks up the weekly final count from email, checks it against the system, and adjusts each item so the system quantity matches the physical count.",
    flow: "Count email → compare → terminal adjustments",
    tags: ["Email", "Terminal", "ERP"]
  },
  {
    area: "reporting", icon: "⚖️", title: "Tonnage Report Formatter",
    text: "Turns the raw shipment-weight report into a three-sheet workbook: outlier rows, corrected item weights for one product family, and the full data with average and variance formulas.",
    flow: "Raw report → 3-sheet analysis workbook",
    tags: ["Excel", "Formulas"]
  },
  {
    area: "reporting", icon: "🎨", title: "Tonnage Report Check",
    text: "Looks up catch weights in the ERP for every outlier row, color-codes each one by my rules, checks bills of lading and reorganizes the sheet after my review.",
    flow: "Outlier rows → ERP lookups → color-coded report",
    tags: ["ERP", "Excel"]
  },
  {
    area: "daily", icon: "🖥️", title: "Worker Desk + PO Desk",
    text: "Two Claude sessions run side by side. One handles screen-based data entry jobs; the other works through PO checks that an email watcher puts in its queue.",
    flow: "Email watcher → job queue → two parallel desks",
    tags: ["Parallel agents", "Email"]
  },
  {
    area: "daily", icon: "☀️", title: "Morning Brief",
    text: "Pulls the morning's priorities into one styled page so I start the day knowing what's waiting.",
    flow: "Email + calendar → one-page brief",
    tags: ["Email", "Calendar"]
  },
  {
    area: "daily", icon: "🔌", title: "Self-Healing Sign-Ins",
    text: "Detects when the remote desktop, ERP or terminal has logged out or a network drive has dropped, reconnects it, and restarts the job that failed.",
    flow: "Detect failure → reconnect → resume",
    tags: ["Desktop control", "Reliability"]
  }
];

const AREA_LABEL = {
  purchasing: "Purchasing & receiving",
  inventory: "Inventory",
  reporting: "Reporting",
  daily: "Daily operations"
};

const grid = document.getElementById("project-grid");
document.getElementById("stat-count").textContent = PROJECTS.length;

function renderProjects(filter) {
  grid.innerHTML = "";
  PROJECTS.filter(p => filter === "all" || p.area === filter).forEach((p, i) => {
    const card = document.createElement("article");
    card.className = "card";
    card.style.animationDelay = `${i * 40}ms`;
    card.innerHTML = `
      <div class="card-top">
        <div class="card-icon" aria-hidden="true">${p.icon}</div>
        <div>
          <div class="card-area">${AREA_LABEL[p.area]}</div>
          <h3>${p.title}</h3>
        </div>
      </div>
      <p>${p.text}</p>
      <div class="card-flow">${p.flow}</div>
      <div class="tags">${p.tags.map(t => `<span class="tag${t.startsWith("Try") ? " tag-warm" : ""}">${t}</span>`).join("")}</div>`;
    grid.appendChild(card);
  });
}

document.querySelectorAll(".chip").forEach(chip => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(c => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    renderProjects(chip.dataset.filter);
  });
});
renderProjects("all");

// ---------- PO discrepancy demo (sample data only) ----------
const PO_LINES = [
  { item: "10021", desc: "Shredded Mozzarella 4/5 LB", qty: 40, cost: 62.50 },
  { item: "10034", desc: "All-Purpose Flour 50 LB",    qty: 25, cost: 18.75 },
  { item: "10058", desc: "Canola Oil 35 LB",           qty: 30, cost: 41.20 },
  { item: "10072", desc: "Tomato Paste 6/#10",         qty: 20, cost: 38.90 },
  { item: "10085", desc: "Black Beans 6/#10",          qty: 15, cost: 29.40 },
  { item: "10091", desc: "Flour Tortillas 12in 6/12ct", qty: 50, cost: 24.10 },
  { item: "10103", desc: "Long Grain Rice 50 LB",      qty: 18, cost: 27.60 },
  { item: "10117", desc: "Sliced Jalapeños 6/#10",     qty: 12, cost: 33.15 }
];

// The vendor's confirmation, with a few planted differences.
const CONF_SAMPLE = [
  { item: "10021", desc: "Shredded Mozzarella 4/5 LB", qty: 40, cost: 62.50 },
  { item: "10034", desc: "All-Purpose Flour 50 LB",    qty: 20, cost: 18.75 }, // short 5
  { item: "10058", desc: "Canola Oil 35 LB",           qty: 30, cost: 43.80 }, // price up
  { item: "10072", desc: "Tomato Paste 6/#10",         qty: 20, cost: 38.90 },
  { item: "10085", desc: "Black Beans 6/#10",          qty: 15, cost: 28.95 }, // price down
  { item: "10091", desc: "Flour Tortillas 12in 6/12ct", qty: 50, cost: 24.10 },
  { item: "10103", desc: "Long Grain Rice 50 LB",      qty: 18, cost: 27.60 },
  // 10117 Jalapeños left off by the vendor
  { item: "10129", desc: "Chipotle Peppers 12/7oz",    qty: 6,  cost: 31.00 }  // not ordered
];

let conf = [];
const money = n => n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const poBody = document.querySelector("#po-table tbody");
const confBody = document.querySelector("#conf-table tbody");
const results = document.getElementById("results");

function renderPO(flags = {}) {
  poBody.innerHTML = PO_LINES.map(l => `
    <tr class="${flags[l.item] ? "flag-" + flags[l.item] : ""}">
      <td>${l.item}</td><td class="desc">${l.desc}</td>
      <td class="num">${l.qty}</td><td class="num">${money(l.cost)}</td>
    </tr>`).join("");
}

function renderConf(flags = {}) {
  confBody.innerHTML = conf.map((l, i) => `
    <tr class="${flags[l.item] ? "flag-" + flags[l.item] : ""}">
      <td>${l.item}</td><td class="desc">${l.desc}</td>
      <td class="num"><input type="number" min="0" step="1" value="${l.qty}" data-i="${i}" data-f="qty" aria-label="Quantity for ${l.desc}"></td>
      <td class="num"><input type="number" min="0" step="0.01" value="${l.cost.toFixed(2)}" data-i="${i}" data-f="cost" aria-label="Unit cost for ${l.desc}"></td>
      <td><button class="icon-btn" data-remove="${i}" title="Remove line" aria-label="Remove ${l.desc}">×</button></td>
    </tr>`).join("");
}

confBody.addEventListener("input", e => {
  const { i, f } = e.target.dataset;
  if (i === undefined) return;
  const v = parseFloat(e.target.value);
  conf[i][f] = isNaN(v) ? 0 : v;
});
confBody.addEventListener("click", e => {
  const i = e.target.dataset.remove;
  if (i === undefined) return;
  conf.splice(Number(i), 1);
  renderConf();
});

function resetDemo() {
  conf = CONF_SAMPLE.map(l => ({ ...l }));
  renderPO();
  renderConf();
  results.hidden = true;
}

function runCheck() {
  const issues = [];
  const poFlags = {}, confFlags = {};
  const confByItem = Object.fromEntries(conf.map(l => [l.item, l]));
  const poByItem = Object.fromEntries(PO_LINES.map(l => [l.item, l]));

  PO_LINES.forEach(po => {
    const c = confByItem[po.item];
    if (!c) {
      issues.push({ kind: "Missing", cls: "s-bad", item: po.item, desc: po.desc,
        detail: `Ordered ${po.qty}, not on confirmation`, impact: -po.qty * po.cost });
      poFlags[po.item] = "bad";
      return;
    }
    if (c.qty !== po.qty) {
      issues.push({ kind: "Quantity", cls: "s-warn", item: po.item, desc: po.desc,
        detail: `Ordered ${po.qty}, confirmed ${c.qty} (${c.qty > po.qty ? "+" : ""}${c.qty - po.qty})`,
        impact: (c.qty - po.qty) * c.cost });
      poFlags[po.item] = confFlags[po.item] = "warn";
    }
    if (Math.abs(c.cost - po.cost) > 0.004) {
      issues.push({ kind: "Price", cls: "s-bad", item: po.item, desc: po.desc,
        detail: `PO ${money(po.cost)} → vendor ${money(c.cost)} per unit`,
        impact: (c.cost - po.cost) * c.qty });
      poFlags[po.item] = confFlags[po.item] = "bad";
    }
  });
  conf.forEach(c => {
    if (!poByItem[c.item]) {
      issues.push({ kind: "Not ordered", cls: "s-info", item: c.item, desc: c.desc,
        detail: `Vendor added ${c.qty} that we didn't order`, impact: c.qty * c.cost });
      confFlags[c.item] = "info";
    }
  });

  const poTotal = PO_LINES.reduce((s, l) => s + l.qty * l.cost, 0);
  const confTotal = conf.reduce((s, l) => s + l.qty * l.cost, 0);
  const count = k => issues.filter(i => i.kind === k).length;
  const diff = confTotal - poTotal;

  renderPO(poFlags);
  renderConf(confFlags);

  results.innerHTML = `
    <h3>${issues.length ? `${issues.length} discrepanc${issues.length === 1 ? "y" : "ies"} found` : "Confirmation matches the PO"}</h3>
    <p class="muted">Checked ${PO_LINES.length} PO lines against ${conf.length} confirmation lines.</p>
    <div class="summary-row">
      <div class="s-bad"><b>${count("Price")}</b><span>price changes</span></div>
      <div class="s-warn"><b>${count("Quantity")}</b><span>quantity changes</span></div>
      <div class="s-bad"><b>${count("Missing")}</b><span>missing items</span></div>
      <div class="s-info"><b>${count("Not ordered")}</b><span>items not ordered</span></div>
    </div>
    ${issues.length ? `<ul class="issue-list">${issues.map(i => `
      <li>
        <span class="badge ${i.cls}">${i.kind}</span>
        <span><strong>${i.item}</strong> ${i.desc}<br><span class="muted">${i.detail}</span></span>
        <span class="issue-money">${i.impact >= 0 ? "+" : "−"}${money(Math.abs(i.impact))}</span>
      </li>`).join("")}</ul>`
      : `<div class="all-good">✓ Every item, quantity and price matches. Nothing to follow up on.</div>`}
    <div class="totals">
      <div>PO total<b>${money(poTotal)}</b></div>
      <div>Confirmation total<b>${money(confTotal)}</b></div>
      <div>Difference<b style="color:var(${Math.abs(diff) < 0.005 ? "--ok" : "--bad"})">${diff >= 0 ? "+" : "−"}${money(Math.abs(diff))}</b></div>
    </div>`;
}

const runBtn = document.getElementById("run-check");
runBtn.addEventListener("click", () => {
  runBtn.disabled = true;
  results.hidden = false;
  results.innerHTML = `<div class="scanning"><div class="spinner"></div>Comparing line by line…</div>`;
  setTimeout(() => {
    runCheck();
    runBtn.disabled = false;
    results.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, 700);
});
document.getElementById("reset-demo").addEventListener("click", resetDemo);
resetDemo();

// ---------- Time-saved calculator ----------
const $ = id => document.getElementById(id);
function calc() {
  const runs = +$("c-runs").value, manual = +$("c-manual").value, auto = +$("c-auto").value;
  $("o-runs").textContent = runs;
  $("o-manual").textContent = manual + " min";
  $("o-auto").textContent = auto + " min";
  const week = Math.max(0, runs * (manual - auto)) / 60;
  const year = week * 50;
  $("r-week").textContent = week.toFixed(1);
  $("r-year").textContent = Math.round(year).toLocaleString();
  $("r-days").textContent = Math.round(year / 8).toLocaleString();
}
["c-runs", "c-manual", "c-auto"].forEach(id => $(id).addEventListener("input", calc));
calc();

$("year").textContent = new Date().getFullYear();
