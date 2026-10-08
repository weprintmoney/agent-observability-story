// Scroll engine: each .step carries data-frame (which .frame layer shows) and optional
// data-state (written to the scrolly's data-state so CSS can animate inside a frame).
(function () {
  const root = document.documentElement;
  try { const t = localStorage.getItem("theme"); if (t) root.dataset.theme = t; } catch (e) {}
  const toggle = document.querySelector(".theme-toggle");
  if (toggle) toggle.addEventListener("click", () => {
    const dark = root.dataset.theme ? root.dataset.theme === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });

  function activate(sc, step) {
    const f = step.dataset.frame;
    sc.querySelectorAll(".frame").forEach(fr => fr.classList.toggle("on", fr.dataset.frame === f));
    sc.querySelectorAll(".step").forEach(s => s.classList.toggle("on", s === step));
    sc.dataset.state = step.dataset.state || "";
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) activate(e.target.closest(".scrolly"), e.target); });
  }, { rootMargin: "-48% 0px -48% 0px" });
  document.querySelectorAll(".scrolly").forEach(sc => {
    const steps = sc.querySelectorAll(".step");
    steps.forEach(s => io.observe(s));
    if (steps[0]) activate(sc, steps[0]);
  });

  // friction bars grow when they enter view
  const grow = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }), { threshold: .25 });
  document.querySelectorAll(".friction").forEach(el => grow.observe(el));

  // progress bar, top bar, chapter dots
  const bar = document.querySelector(".progress span");
  const top = document.querySelector(".topbar");
  const label = document.querySelector(".topbar .chap");
  const chapters = [...document.querySelectorAll("[data-chapter]")];
  const dots = [...document.querySelectorAll(".topbar nav a")];
  function onScroll() {
    const h = document.documentElement.scrollHeight - innerHeight;
    if (bar) bar.style.width = (100 * scrollY / Math.max(h, 1)) + "%";
    if (top) top.classList.toggle("show", scrollY > innerHeight * .7);
    let cur = -1;
    chapters.forEach((c, i) => { if (c.getBoundingClientRect().top < innerHeight * .4) cur = i; });
    if (label) label.textContent = cur >= 0 ? chapters[cur].dataset.chapter : "";
    dots.forEach((d, i) => d.classList.toggle("on", i === cur));
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
