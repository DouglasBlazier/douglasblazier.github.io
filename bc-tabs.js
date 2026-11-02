// Turns the Buyer's Corner issues into tabs: a Full / Shortened switch plus one tab per issue date.
// Works on any container holding <article class="bc-issue" id="issue-YYYY-MM-DD"> (full)
// and id="issue-YYYY-MM-DD-short" (shortened). Contains no newsletter content.
(function () {
  function setTopbarHeight() {
    const bar = document.querySelector(".topbar");
    document.documentElement.style.setProperty("--topbar-h", (bar ? bar.offsetHeight : 0) + "px");
  }
  window.addEventListener("resize", setTopbarHeight);

  window.initBcTabs = function (root) {
    const issues = [...root.querySelectorAll('.bc-issue[id^="issue-"]')].map(el => {
      const m = el.id.match(/^issue-(\d{4}-\d{2}-\d{2})(-short)?$/);
      if (!m) return null;
      const dateEl = el.querySelector(".bc-date");
      return { el, date: m[1], v: m[2] ? "short" : "full", label: (dateEl ? dateEl.textContent : m[1]).replace(/^Shortened\s+/i, "").trim() };
    }).filter(Boolean);
    if (!issues.length) return;

    setTopbarHeight();
    root.classList.add("bc-tabbed");

    const dates = [];
    issues.forEach(i => { if (!dates.some(d => d.date === i.date)) dates.push({ date: i.date, label: i.label }); });
    const versions = ["full", "short"].filter(v => issues.some(i => i.v === v));
    const VERSION_LABEL = { full: "Full", short: "Shortened" };

    let cur = { v: versions[0], date: dates[0].date };
    const fromHash = (location.hash || "").match(/^#issue-(\d{4}-\d{2}-\d{2})(-short)?$/);
    if (fromHash) cur = { date: fromHash[1], v: fromHash[2] ? "short" : "full" };

    const bar = document.createElement("div");
    bar.className = "bc-tabbar";
    bar.innerHTML =
      '<div class="bc-seg" role="tablist" aria-label="Version">' +
      versions.map(v => '<button type="button" role="tab" data-v="' + v + '">' + VERSION_LABEL[v] + "</button>").join("") +
      '</div><div class="bc-datetabs" role="tablist" aria-label="Issue date">' +
      dates.map(d => {
        const [y, mo, day] = d.date.split("-").map(Number);
        const short = new Date(y, mo - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return '<button type="button" role="tab" data-date="' + d.date + '" aria-label="' + d.label + '"><span class="lg">' + d.label + '</span><span class="sm">' + short + "</span></button>";
      }).join("") +
      "</div>";
    root.prepend(bar);

    function render(scroll) {
      let match = issues.find(i => i.v === cur.v && i.date === cur.date);
      if (!match) { match = issues.find(i => i.date === cur.date) || issues[0]; cur = { v: match.v, date: match.date }; }
      issues.forEach(i => { i.el.hidden = i !== match; });
      bar.querySelectorAll("[data-v]").forEach(b => { const on = b.dataset.v === cur.v; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
      bar.querySelectorAll("[data-date]").forEach(b => {
        const on = b.dataset.date === cur.date;
        b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
        b.disabled = !issues.some(i => i.date === b.dataset.date && i.v === cur.v);
      });
      try { history.replaceState(null, "", "#" + match.el.id); } catch (e) {}
      if (scroll) {
        const topbarH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--topbar-h")) || 0;
        const y = root.getBoundingClientRect().top + window.scrollY - topbarH;
        if (window.scrollY > y) window.scrollTo(0, y);
      }
    }

    bar.addEventListener("click", e => {
      const b = e.target.closest("button");
      if (!b || b.disabled) return;
      if (b.dataset.v) cur.v = b.dataset.v;
      if (b.dataset.date) cur.date = b.dataset.date;
      render(true);
    });

    // Left / right arrow keys move between tabs in the same row.
    bar.addEventListener("keydown", e => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const list = e.target.closest('[role="tablist"]');
      if (!list) return;
      const tabs = [...list.querySelectorAll("button:not([disabled])")];
      const i = tabs.indexOf(e.target);
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
      if (next) { next.focus(); next.click(); }
    });

    render(false);
  };
})();
