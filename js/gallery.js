/* SAMGEC — portfolio lightbox
   Each .work-card carries its project in data attributes:
     data-gallery  folder slug under assets/poze-web/
     data-photos   how many images (files are 01.jpg … NN.jpg)
     data-video    present when the project is a video instead of stills
     data-title    heading shown in the lightbox
   Image paths are derived from the slug + index, so there is no manifest to
   keep in sync and no filename escaping to get wrong. */

(function () {
  "use strict";

  const cards = document.querySelectorAll(".work-card[data-gallery]");
  if (!cards.length) return;

  const docEl = document.documentElement;
  const BASE = "assets/poze-web/";
  const pad = (n) => String(n).padStart(2, "0");

  const lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.hidden = true;
  lb.innerHTML =
    '<div class="lb-head">' +
      '<div><span class="lb-title"></span><span class="lb-count"></span></div>' +
      '<button class="lb-close" type="button" aria-label="Închide">&times;</button>' +
    "</div>" +
    '<div class="lb-stage">' +
      '<button class="lb-nav lb-prev" type="button" aria-label="Imaginea anterioară">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>' +
      "</button>" +
      '<div class="lb-media"></div>' +
      '<button class="lb-nav lb-next" type="button" aria-label="Imaginea următoare">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>' +
      "</button>" +
    "</div>" +
    '<div class="lb-strip"></div>';
  document.body.appendChild(lb);

  const els = {
    title: lb.querySelector(".lb-title"),
    count: lb.querySelector(".lb-count"),
    media: lb.querySelector(".lb-media"),
    strip: lb.querySelector(".lb-strip"),
    prev: lb.querySelector(".lb-prev"),
    next: lb.querySelector(".lb-next"),
    close: lb.querySelector(".lb-close"),
    stage: lb.querySelector(".lb-stage"),
  };

  let project = null;
  let index = 0;
  let lastFocus = null;

  const fullSrc = (slug, i) => BASE + slug + "/full/" + pad(i + 1) + ".jpg";
  const thumbSrc = (slug, i) => BASE + slug + "/thumb/" + pad(i + 1) + ".jpg";

  function show(i) {
    if (!project || project.video) return;
    index = (i + project.photos) % project.photos;
    const img = els.media.querySelector("img");
    img.src = fullSrc(project.slug, index);
    img.alt = project.title + " — fotografia " + (index + 1);
    els.count.textContent = index + 1 + " / " + project.photos;
    els.strip.querySelectorAll("img").forEach((t, n) => t.classList.toggle("is-active", n === index));
    const active = els.strip.children[index];
    if (active) active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    // Warm the neighbours so arrowing through feels instant
    [index + 1, index - 1].forEach((n) => {
      const j = (n + project.photos) % project.photos;
      new Image().src = fullSrc(project.slug, j);
    });
  }

  function open(card) {
    project = {
      slug: card.dataset.gallery,
      photos: Number(card.dataset.photos) || 0,
      video: card.hasAttribute("data-video"),
      title: card.dataset.title || card.querySelector("h3").textContent,
    };
    lastFocus = document.activeElement;
    els.title.textContent = project.title;
    els.media.innerHTML = "";
    els.strip.innerHTML = "";

    if (project.video) {
      els.count.textContent = "";
      const v = document.createElement("video");
      v.controls = true;
      v.playsInline = true;
      v.preload = "metadata";
      v.src = BASE + project.slug + "/video.mp4";
      els.media.appendChild(v);
      els.prev.hidden = els.next.hidden = true;
      els.strip.hidden = true;
    } else {
      els.prev.hidden = els.next.hidden = project.photos < 2;
      els.strip.hidden = project.photos < 2;
      els.media.appendChild(document.createElement("img"));
      for (let i = 0; i < project.photos; i++) {
        const t = document.createElement("img");
        t.src = thumbSrc(project.slug, i);
        t.loading = "lazy";
        t.alt = "";
        t.addEventListener("click", () => show(i));
        els.strip.appendChild(t);
      }
      show(0);
    }

    lb.hidden = false;
    void lb.offsetWidth; // let the transition run from hidden
    lb.classList.add("show");
    docEl.classList.add("lb-open");
    els.close.focus();
  }

  function close() {
    lb.classList.remove("show");
    docEl.classList.remove("lb-open");
    const v = els.media.querySelector("video");
    if (v) v.pause();
    window.setTimeout(() => {
      lb.hidden = true;
      els.media.innerHTML = "";
      els.strip.innerHTML = "";
      project = null;
    }, 350);
    if (lastFocus) lastFocus.focus();
  }

  cards.forEach((card) => {
    const btn = card.querySelector(".btn");
    if (btn) btn.addEventListener("click", (e) => { e.stopPropagation(); open(card); });
    card.addEventListener("click", () => open(card));
    card.style.cursor = "pointer";
  });

  els.prev.addEventListener("click", () => show(index - 1));
  els.next.addEventListener("click", () => show(index + 1));
  els.close.addEventListener("click", close);
  els.stage.addEventListener("click", (e) => { if (e.target === els.stage) close(); });

  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowRight") show(index + 1);
    else if (e.key === "ArrowLeft") show(index - 1);
  });
})();
