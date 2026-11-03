// ---------- Projects ----------
// Descriptions are kept general on purpose: no company names, people, servers or real data.
const PROJECTS = [
  {
    area: "purchasing", icon: "🧾", title: "PO Discrepancy Check",
    text: "Compares each purchase order against the vendor's order confirmation and marks every quantity, unit-cost and extended-cost difference directly on the PO PDF, then adds a summary page. The confirmed prices and quantities are then keyed into the ERP's Change Purchase Order screen, so the PO is correct before the truck arrives.",
    flow: "PO + vendor confirmation → annotated PDF + summary → ERP PO updated",
    tags: ["PDF", "Email", "ERP"]
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

// Each area has its own page; each project has a section on that page.
const AREA_PAGE = {
  purchasing: "purchasing.html",
  inventory: "inventory.html",
  reporting: "reporting.html",
  daily: "daily-operations.html"
};
const slug = s => s.toLowerCase().replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

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
      <div class="tags">${p.tags.map(t => `<span class="tag${t.startsWith("Try") ? " tag-warm" : ""}">${t}</span>`).join("")}</div>
      <a class="card-cta" href="${AREA_PAGE[p.area]}#${slug(p.title)}">See examples <span aria-hidden="true">→</span></a>`;
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

document.getElementById("year").textContent = new Date().getFullYear();
