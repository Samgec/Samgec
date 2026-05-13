/* SAMGEC — site interactions
   Uses GSAP + ScrollTrigger (loaded via CDN in HTML).
   Falls back to IntersectionObserver-only reveals if GSAP fails. */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const docEl = document.documentElement;

  /* ---------- Nav: solid on scroll ---------- */
  const nav = document.querySelector(".nav");
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 32) nav.classList.add("solid");
      else nav.classList.remove("solid");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      docEl.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", docEl.classList.contains("nav-open"));
    });
    document.querySelectorAll(".nav-overlay a").forEach((a) =>
      a.addEventListener("click", () => docEl.classList.remove("nav-open"))
    );
  }

  /* ---------- Reveal via IntersectionObserver (always-on baseline) ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("show");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("show"));
  }

  if (reduced) return; // bail before GSAP for reduced motion

  /* ---------- GSAP enhancements ---------- */
  if (typeof window.gsap === "undefined") return;
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* Hero: stagger words */
  const heroH1 = document.querySelector(".hero h1");
  if (heroH1 && !heroH1.dataset.split) {
    heroH1.dataset.split = "1";
    const html = heroH1.innerHTML;
    // Split top-level text nodes into word spans, preserve inner spans (e.g. .ink)
    const wrap = document.createElement("div");
    wrap.innerHTML = html;
    const out = [];
    wrap.childNodes.forEach((node) => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach((w) => {
          if (!w.trim()) out.push(w);
          else out.push(`<span class="word">${w}</span>`);
        });
      } else {
        const cls = node.className ? ` ${node.className}` : "";
        out.push(`<span class="word${cls}">${node.innerHTML}</span>`);
      }
    });
    heroH1.innerHTML = out.join("");

    gsap.from(".hero h1 .word", {
      yPercent: 110,
      opacity: 0,
      duration: 1.05,
      ease: "power4.out",
      stagger: 0.045,
      delay: 0.15,
    });
  }

  gsap.from(".hero-eyebrow, .hero-lead, .hero-cta, .hero-stats", {
    y: 28,
    opacity: 0,
    duration: 0.9,
    ease: "power3.out",
    stagger: 0.12,
    delay: 0.5,
  });

  gsap.from(".hero-asset", { scale: 0.92, opacity: 0, duration: 1.4, ease: "power3.out", delay: 0.3 });

  /* Parallax on hero asset */
  if (ScrollTrigger) {
    gsap.to(".hero-asset", {
      yPercent: -12,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
    gsap.to(".hero h1", {
      yPercent: 10,
      opacity: 0.4,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }

  /* Count-up numbers when in view */
  if (ScrollTrigger) {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const decimals = (el.dataset.count.split(".")[1] || "").length;
      const suffix = el.dataset.suffix || "";
      const obj = { v: 0 };
      ScrollTrigger.create({
        trigger: el,
        start: "top 85%",
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            v: target,
            duration: 1.8,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = obj.v.toFixed(decimals).replace(/\.0+$/, "") + suffix;
            },
          });
        },
      });
    });
  }

  /* Timeline: progress line + step activation */
  document.querySelectorAll(".timeline").forEach((tl) => {
    const progress = tl.querySelector(".progress");
    const steps = tl.querySelectorAll(".step");
    if (!progress || !steps.length || !ScrollTrigger) return;

    gsap.to(progress, {
      height: "100%",
      ease: "none",
      scrollTrigger: { trigger: tl, start: "top 75%", end: "bottom 65%", scrub: true },
    });

    steps.forEach((step) => {
      ScrollTrigger.create({
        trigger: step,
        start: "top 75%",
        end: "bottom 60%",
        toggleClass: { targets: step, className: "is-active" },
      });
    });
  });

  /* Section heading reveal via clipPath */
  if (ScrollTrigger) {
    gsap.utils.toArray(".section-head h2").forEach((h) => {
      gsap.from(h, {
        clipPath: "inset(0 100% 0 0)",
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: { trigger: h, start: "top 85%" },
      });
    });
  }

  /* Card stagger on enter */
  if (ScrollTrigger) {
    gsap.utils.toArray(".stagger-cards").forEach((row) => {
      gsap.from(row.children, {
        y: 36,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: row, start: "top 80%" },
      });
    });
  }

  /* Brand grid: subtle scale on enter */
  if (ScrollTrigger) {
    gsap.utils.toArray(".brand-grid").forEach((grid) => {
      gsap.from(grid.children, {
        scale: 0.95,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        stagger: 0.06,
        scrollTrigger: { trigger: grid, start: "top 85%" },
      });
    });
  }
})();
