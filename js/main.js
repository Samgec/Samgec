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

  /* ---------- Expandable service cards ----------
     Click a card: it pins itself with position:fixed at the exact spot it
     already occupies, then animates its rect to the centre of the viewport
     while the backdrop dims everything behind it. Closing plays it backwards
     to the stored origin rect. A placeholder keeps the grid slot filled so
     nothing behind the card shifts while it is out of flow. */
  (function expandableCards() {
    const grid = document.querySelector("#servicii .stagger-cards");
    if (!grid) return;
    // Direct children only: the PV card nests .card.dark tiles in its body,
    // which must not become expandable cards themselves.
    const cards = Array.from(grid.children).filter(
      (c) => c.classList.contains("card") && c.querySelector(".card-body")
    );
    if (!cards.length) return;

    const backdrop = document.createElement("div");
    backdrop.className = "card-backdrop";
    document.body.appendChild(backdrop);

    let openCard = null;
    let placeholder = null;
    let origin = null;
    let restoreCss = "";
    let animating = false;

    // A card may ask for a wider opened width via data-expand-width.
    const targetRect = (card) => {
      const vw = docEl.clientWidth;
      const vh = window.innerHeight;
      const max = Number(card.dataset.expandWidth) || 640;
      return { w: Math.min(max, vw - 40), vw: vw, vh: vh };
    };

    function open(card) {
      if (openCard || animating) return;
      animating = true;

      // The entry-stagger tween writes inline opacity/transform on these very
      // cards. If it is still running, finish it — do NOT kill it. The stagger
      // is a single tween over every card in the grid, so killing it freezes
      // the siblings mid-flight at translate(0, 36px) while this card returns
      // to its true position, leaving the row 36px out of line. Completing it
      // settles every card at its final opacity/offset instead.
      if (window.gsap) {
        window.gsap.getTweensOf(card).forEach((t) => t.progress(1));
      }
      card.style.opacity = "1";
      card.style.transform = "none";

      // Snapshot the card's own inline styles now that they are settled, and
      // put exactly these back on close. Wiping inline styles instead would
      // strip the stagger's transform (leaving this card 36px above its
      // row-mates, which keep theirs) and, on the featured card, its inline
      // border-color and background gradient.
      restoreCss = card.style.cssText;

      const first = card.getBoundingClientRect();
      origin = { left: first.left, top: first.top, width: first.width, height: first.height };

      placeholder = document.createElement("div");
      placeholder.className = "card-placeholder";
      placeholder.style.width = first.width + "px";
      placeholder.style.height = first.height + "px";
      card.parentNode.insertBefore(placeholder, card);

      // Pin the card exactly where it already sits — no visual jump.
      card.style.transition = "none";
      card.style.position = "fixed";
      card.style.margin = "0";
      card.style.transform = "none";
      card.style.left = first.left + "px";
      card.style.top = first.top + "px";
      card.style.width = first.width + "px";
      card.style.height = first.height + "px";
      card.classList.add("is-open");
      card.setAttribute("aria-expanded", "true");

      // Lock the page: the card is viewport-fixed, so the origin rect we
      // animate back to is only valid while the page stays put.
      const bar = window.innerWidth - docEl.clientWidth;
      docEl.classList.add("card-zoom-open");
      if (bar > 0) {
        document.body.style.paddingRight = bar + "px";
        if (nav) nav.style.paddingRight = bar + "px";
      }

      // Measure the opened height at the target width, then rewind and play to it.
      const t = targetRect(card);
      card.style.width = t.w + "px";
      card.style.height = "auto";
      const natural = card.offsetHeight;
      const h = Math.min(natural, t.vh - 40);

      card.style.width = first.width + "px";
      card.style.height = first.height + "px";
      void card.offsetWidth; // flush the rewind before transitioning

      card.style.transition = "";
      card.style.left = Math.round((t.vw - t.w) / 2) + "px";
      card.style.top = Math.round((t.vh - h) / 2) + "px";
      card.style.width = t.w + "px";
      card.style.height = h + "px";

      backdrop.classList.add("show");
      openCard = card;
      window.setTimeout(() => { animating = false; }, 80);
    }

    function close() {
      if (!openCard || animating) return;
      animating = true;

      const card = openCard;
      card.classList.add("is-closing");
      card.style.left = origin.left + "px";
      card.style.top = origin.top + "px";
      card.style.width = origin.width + "px";
      card.style.height = origin.height + "px";
      backdrop.classList.remove("show");

      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        card.removeEventListener("transitionend", onEnd);
        card.classList.remove("is-open", "is-closing");
        card.setAttribute("aria-expanded", "false");
        card.style.cssText = restoreCss;
        if (placeholder) placeholder.remove();
        placeholder = null;
        openCard = null;
        origin = null;
        docEl.classList.remove("card-zoom-open");
        document.body.style.paddingRight = "";
        if (nav) nav.style.paddingRight = "";
        animating = false;
      };
      const onEnd = (e) => {
        if (e.target === card && e.propertyName === "height") finish();
      };
      card.addEventListener("transitionend", onEnd);
      window.setTimeout(finish, 700); // safety net if transitionend never lands
    }

    cards.forEach((card) => {
      card.classList.add("is-expandable");
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-expanded", "false");

      const actions = document.createElement("div");
      actions.className = "card-actions";

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.className = "btn ghost btn-sm";
      closeBtn.textContent = "Închide";

      const detailsBtn = document.createElement("a");
      detailsBtn.className = "btn btn-sm";
      detailsBtn.href = "contact.html";
      detailsBtn.innerHTML = 'Vezi detalii <span class="arr">→</span>';

      actions.appendChild(closeBtn);
      actions.appendChild(detailsBtn);
      card.appendChild(actions);

      closeBtn.addEventListener("click", (e) => { e.stopPropagation(); close(); });
      detailsBtn.addEventListener("click", (e) => e.stopPropagation());

      card.addEventListener("click", () => {
        if (!card.classList.contains("is-open")) open(card);
      });
      card.addEventListener("keydown", (e) => {
        if (card.classList.contains("is-open")) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(card);
        }
      });
    });

    backdrop.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && openCard) close();
    });

    // Keep the open card centred if the viewport changes underneath it.
    window.addEventListener("resize", () => {
      if (!openCard) return;
      const card = openCard;
      const t = targetRect(card);
      const prevH = card.style.height;
      card.style.height = "auto";
      const h = Math.min(card.offsetHeight, t.vh - 40);
      card.style.height = prevH;
      void card.offsetWidth;
      card.style.left = Math.round((t.vw - t.w) / 2) + "px";
      card.style.top = Math.round((t.vh - h) / 2) + "px";
      card.style.width = t.w + "px";
      card.style.height = h + "px";
    });
  })();

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

  /* Card stagger on enter.
     once + clearProps matter beyond tidiness: without them the ScrollTrigger
     stays live and re-applies the "from" state (opacity 0, y 36) on every
     ScrollTrigger.refresh() — which fires on resize and whenever the document
     height changes, including when an expanding card locks page scroll. That
     left cards invisible after a resize and knocked a closed card 36px out of
     line with its row. clearProps also leaves no inline transform behind, so
     the cards sit at their natural CSS position. */
  if (ScrollTrigger) {
    gsap.utils.toArray(".stagger-cards").forEach((row) => {
      gsap.from(row.children, {
        y: 36,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.08,
        clearProps: "transform,opacity",
        scrollTrigger: { trigger: row, start: "top 80%", once: true },
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
