// "A day in the life" replay on the home page. Sample data only; times and results are illustrative.
(function () {
  const root = document.getElementById("day");
  if (!root) return;

  const T = (h, m) => h * 60 + m;             // minutes since midnight
  const START = T(7, 25), END = T(17, 5);
  const MIN_PER_SEC = 5;                      // simulated minutes per real second at 1x

  // Email arriving in the inbox, and what the Email Watcher did with it.
  const EMAILS = [
    { t: T(8, 15), from: "Announcements", subject: "Daily announcements", tag: "Filed" },
    { t: T(8, 42), from: "Meat room scanner", subject: "Inventory transfers scan (4 pages)", tag: "MR" },
    { t: T(9, 14), from: "Accounting", subject: "Daily Credit Register", tag: "NT" },
    { t: T(10, 5), from: "Copier", subject: "POs + vendor confirmations (14 pages)", tag: "PO" },
    { t: T(11, 30), from: "Accounting", subject: "Please get out of the ERP", tag: "OUT" },
    { t: T(11, 52), from: "Accounting", subject: "You can get back in", tag: "IN" },
    { t: T(12, 40), from: "Transportation", subject: "Driver form", tag: "Flagged" },
    { t: T(14, 8), from: "Meat room", subject: "Weekly final count spreadsheet", tag: "MF" }
  ];

  // Jobs in the queue: when queued, when a desk picked it up, when it finished.
  const JOBS = [
    { code: "RP", name: "Today's Receiving POs", desk: "worker", queued: T(7, 35), start: T(7, 35), end: T(7, 41) },
    { code: "MR", name: "Meat Room Adjustments", desk: "worker", queued: T(8, 43), start: T(8, 43), end: T(8, 59) },
    { code: "TR", name: "Tonnage Report", desk: "worker", queued: T(9, 0), start: T(9, 0), end: T(9, 24) },
    { code: "NT", name: "Not-On-Truck Adjustments", desk: "worker", queued: T(9, 15), start: T(9, 24), end: T(9, 36) },
    { code: "PO", name: "PO Discrepancy Check", desk: "po", queued: T(10, 6), start: T(10, 6), end: T(10, 24) },
    { code: "PO", name: "Key PO changes in the ERP", desk: "po", queued: T(10, 24), start: T(10, 24), end: T(10, 31) },
    { code: "OUT", name: "Get out of the ERP", desk: "worker", queued: T(11, 31), start: T(11, 31), end: T(11, 33) },
    { code: "IN", name: "Back into the ERP", desk: "worker", queued: T(11, 53), start: T(11, 53), end: T(11, 55) },
    { code: "MF", name: "Weekly Final-Count Adjustments", desk: "worker", queued: T(14, 9), start: T(14, 9), end: T(14, 29) }
  ];

  // One-line phone notifications.
  const NOTES = [
    { t: T(7, 31), text: "Worker Desk and PO Desk ready" },
    { t: T(7, 41), text: "Today's Receiving PO's printed (4 POs, 1 page)" },
    { t: T(8, 59), text: "MR keyed: 24 lines, imported 24. 1 question in Worker Desk" },
    { t: T(9, 24), text: "Tonnage report ready: 7 rows to review" },
    { t: T(9, 36), text: "NT keyed: 4 posted, 1 skipped. Totals match the register ✓" },
    { t: T(10, 24), text: "PO check: 3 POs filed, 5 discrepancies" },
    { t: T(10, 31), text: "PO changes keyed: all 3 POs now match their confirmations" },
    { t: T(11, 33), text: "Out of the ERP: closed cleanly, keying paused" },
    { t: T(11, 55), text: "Back in the ERP: held jobs released" },
    { t: T(13, 6), text: "ERP closed unexpectedly. Reopened and signed in, nothing lost" },
    { t: T(14, 29), text: "MF keyed: 18 items now match the weekly count" },
    { t: T(17, 0), text: "Day done: 9 jobs, 0 errors, 1 question answered" }
  ];

  // ERP connection status.
  const ERP = [
    { t: START, cls: "off", text: "ERP: remote desktop not open yet" },
    { t: T(7, 30), cls: "ok", text: "ERP: signed in by login macros" },
    { t: T(11, 31), cls: "out", text: "ERP: closed for accounting" },
    { t: T(11, 54), cls: "ok", text: "ERP: signed back in" },
    { t: T(13, 5), cls: "bad", text: "ERP: crashed, reopening…" },
    { t: T(13, 6), cls: "ok", text: "ERP: reopened and signed in" }
  ];

  const $ = id => document.getElementById(id);
  const els = {
    play: $("day-play"), restart: $("day-restart"), clock: $("day-clock"), scrub: $("day-scrub"),
    marks: $("day-marks"), hours: $("day-hours"), watcher: $("day-watcher"), inbox: $("day-inbox"),
    queue: $("day-queue"), worker: $("desk-worker"), po: $("desk-po"), erp: $("day-erp"),
    notes: $("day-notes"), phoneTime: $("day-phone-time")
  };

  const fmt = t => {
    const h = Math.floor(t / 60), m = Math.floor(t % 60);
    return ((h + 11) % 12 + 1) + ":" + String(m).padStart(2, "0") + " " + (h < 12 ? "AM" : "PM");
  };
  const pct = t => ((t - START) / (END - START) * 100).toFixed(2) + "%";
  const esc = s => s.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const isNew = (itemT, t) => t - itemT < 6;

  // Timeline markers and hour labels.
  els.scrub.min = START; els.scrub.max = END;
  els.marks.innerHTML = JOBS.map(j => '<i class="' + j.desk + '" style="left:' + pct(j.queued) + '" title="' + fmt(j.queued) + " · " + esc(j.name) + '"></i>').join("");
  let hours = "";
  for (let h = 8; h <= 17; h++) hours += '<span style="left:' + pct(T(h, 0)) + '">' + ((h + 11) % 12 + 1) + (h < 12 ? " AM" : " PM") + "</span>";
  els.hours.innerHTML = hours;

  const keys = {};
  function setIfChanged(name, key, el, html) {
    if (keys[name] === key) return;
    keys[name] = key;
    el.innerHTML = html;
  }

  function jobStatus(j, t) { return t < j.start ? "queued" : t < j.end ? "working" : "done"; }

  function renderDesk(desk, el, t) {
    const label = desk === "worker" ? "Worker Desk" : "PO Desk";
    const job = JOBS.find(j => j.desk === desk && t >= j.start && t < j.end);
    const state = t < T(7, 31) ? "off" : job ? "busy" : "idle";
    const doing = state === "off" ? "Starts at 7:31 AM" : job ? esc(job.name) + " · started " + fmt(job.start) : "Watching the queue";
    setIfChanged(desk, state + (job ? job.start : ""), el,
      "<b>" + label + "</b><div class=\"day-doing\">" + doing + "</div><div class=\"day-bar\"><span></span></div>");
    el.classList.toggle("busy", state === "busy");
    el.classList.toggle("off", state === "off");
    const bar = el.querySelector(".day-bar span");
    bar.style.width = job ? ((t - job.start) / (job.end - job.start) * 100) + "%" : "0%";
  }

  function render(t) {
    els.clock.textContent = fmt(t);
    els.phoneTime.textContent = fmt(t).replace(/ (AM|PM)/, "");
    if (!dragging) els.scrub.value = t;

    const watcher = t < T(8, 0) ? "Email Watcher starts at 8:00 AM" : t < T(17, 0) ? "Email Watcher: checking every minute" : "Email Watcher: done for the day";
    els.watcher.textContent = watcher;

    const mail = EMAILS.filter(e => e.t <= t).reverse().slice(0, 5);
    setIfChanged("inbox", mail.map(e => e.t).join(","), els.inbox, mail.length ? mail.map((e, i) =>
      '<li class="' + (i === 0 && isNew(e.t, t) ? "new" : "") + '"><span class="day-tag' + (/^(Filed|Flagged)$/.test(e.tag) ? " muted-tag" : "") + '">' + (e.tag === "Filed" || e.tag === "Flagged" ? e.tag : "→ " + e.tag) + "</span>" +
      esc(e.subject) + "<small>" + esc(e.from) + " · " + fmt(e.t) + "</small></li>").join("") : '<li class="day-empty">No new email yet</li>');

    const jobs = JOBS.filter(j => j.queued <= t).reverse().slice(0, 6);
    setIfChanged("queue", jobs.map(j => j.queued + jobStatus(j, t)).join(","), els.queue, jobs.length ? jobs.map((j, i) => {
      const st = jobStatus(j, t);
      const word = st === "queued" ? "Waiting" : st === "working" ? (j.desk === "po" ? "PO Desk" : "Worker Desk") : "Done";
      return '<li class="' + (i === 0 && st === "queued" && isNew(j.queued, t) ? "new" : "") + '"><span class="day-code">' + j.code + "</span>" + esc(j.name) +
        '<small><span class="st st-' + st + '">' + word + "</span> · queued " + fmt(j.queued) + "</small></li>";
    }).join("") : '<li class="day-empty">Queue is empty</li>');

    renderDesk("worker", els.worker, t);
    renderDesk("po", els.po, t);

    const erp = ERP.filter(e => e.t <= t).pop() || ERP[0];
    setIfChanged("erp", erp.text, els.erp, erp.text);
    els.erp.className = "day-erp erp-" + erp.cls;

    const notes = NOTES.filter(n => n.t <= t).reverse().slice(0, 4);
    setIfChanged("notes", notes.map(n => n.t).join(","), els.notes, notes.map((n, i) =>
      '<div class="notif' + (i === 0 && isNew(n.t, t) ? " new" : "") + '"><b>Claude Code <span>' + fmt(n.t) + "</span></b>" + esc(n.text) + "</div>").join(""));
  }

  // Playback
  let t = START, playing = false, speed = 2, last = 0, dragging = false;

  function setPlaying(on) {
    playing = on;
    els.play.textContent = on ? "⏸ Pause" : (t >= END ? "▶ Replay" : "▶ Play");
    if (on) { last = performance.now(); requestAnimationFrame(tick); }
  }
  function tick(now) {
    if (!playing) return;
    t = Math.max(START, Math.min(END, t + Math.max(0, now - last) / 1000 * MIN_PER_SEC * speed));
    last = now;
    render(t);
    if (t >= END) return setPlaying(false);
    requestAnimationFrame(tick);
  }

  els.play.addEventListener("click", () => {
    if (!playing && t >= END) t = START;
    setPlaying(!playing);
  });
  els.restart.addEventListener("click", () => { t = START; render(t); setPlaying(true); });
  root.querySelectorAll("[data-speed]").forEach(b => b.addEventListener("click", () => {
    speed = Number(b.dataset.speed);
    root.querySelectorAll("[data-speed]").forEach(x => x.setAttribute("aria-pressed", x === b));
  }));
  els.scrub.addEventListener("input", () => { dragging = true; t = Number(els.scrub.value); render(t); });
  els.scrub.addEventListener("change", () => { dragging = false; });

  render(t);

  // Start playing the first time the replay scrolls into view (unless the viewer prefers less motion).
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { io.disconnect(); if (!playing && t === START) setPlaying(true); }
    }, { threshold: 0.35 });
    io.observe(root);
  }
})();
