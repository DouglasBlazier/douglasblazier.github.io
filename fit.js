// Shrinks any mock screenshot that is still wider than its window (mostly on phones),
// so the whole screen shows without sideways scrolling. People can still pinch to zoom.
(function () {
  const scrollers = () => {
    const out = [];
    document.querySelectorAll(".win").forEach(win => {
      [win, ...win.querySelectorAll("*")].forEach(el => {
        const ox = getComputedStyle(el).overflowX;
        if (ox === "auto" || ox === "scroll" || ox === "hidden") out.push(el);
      });
    });
    return out;
  };

  function fit() {
    const els = scrollers();
    els.forEach(el => { el.style.zoom = ""; });
    // Inner boxes first, then their windows, so each level only shrinks what is left over.
    els.reverse().forEach(el => {
      for (let i = 0; i < 3; i++) {
        const over = el.scrollWidth - el.clientWidth;
        if (over <= 1 || !el.clientWidth) break;
        const z = (parseFloat(el.style.zoom) || 1) * (el.clientWidth / el.scrollWidth);
        el.style.zoom = Math.max(z, 0.4).toFixed(3);
      }
    });
  }

  let t;
  const later = () => { clearTimeout(t); t = setTimeout(fit, 150); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fit); else fit();
  window.addEventListener("load", fit);
  window.addEventListener("resize", later);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
})();
