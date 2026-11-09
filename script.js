/* =========================================================
   НАСТРОЙКИ — правьте здесь
   ========================================================= */

// false — фото грузятся с Unsplash; true — из папки images/ (имена см. в data-local у <img>)
const USE_LOCAL_IMAGES = false;

/* =========================================================
   Локальные картинки
   ========================================================= */
if (USE_LOCAL_IMAGES) {
  document.querySelectorAll("img[data-local]").forEach((img) => {
    img.src = img.dataset.local;
  });
}

/* =========================================================
   Шапка: фон при скролле + бургер
   ========================================================= */
const header = document.querySelector(".header");
const burger = document.querySelector(".burger");
const nav = document.querySelector(".nav");

function onScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 40);
}
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

function setMenu(open) {
  header.classList.toggle("menu-open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
}
burger.addEventListener("click", () => setMenu(!header.classList.contains("menu-open")));
nav.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

/* =========================================================
   Кнопка «Заказать» → подставляет услугу в форму
   ========================================================= */
const serviceSelect = document.querySelector('#order-form select[name="service"]');
document.querySelectorAll("[data-service]").forEach((btn) => {
  btn.addEventListener("click", () => {
    serviceSelect.value = btn.dataset.service;
  });
});

/* =========================================================
   Появление блоков при скролле
   ========================================================= */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  revealEls.forEach((el, i) => {
    // лёгкая «лесенка» для соседних элементов
    el.style.transitionDelay = `${(i % 3) * 0.08}s`;
    io.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}

/* =========================================================
   Lightbox
   ========================================================= */
const galleryImgs = Array.from(document.querySelectorAll(".gallery__item img"));
const lightbox = document.getElementById("lightbox");
const lbImg = lightbox.querySelector(".lightbox__img");
const lbCaption = lightbox.querySelector(".lightbox__caption");
let current = 0;
let lastFocus = null;

function fullSize(src) {
  // для Unsplash берём версию побольше; локальные файлы — как есть
  return src.includes("images.unsplash.com") ? src.replace(/w=\d+/, "w=2000") : src;
}

function showImage(index) {
  current = (index + galleryImgs.length) % galleryImgs.length;
  const img = galleryImgs[current];
  lbImg.src = fullSize(img.currentSrc || img.src);
  lbImg.alt = img.alt;
  lbCaption.textContent = `${img.alt} · ${current + 1} / ${galleryImgs.length}`;
}

function openLightbox(index) {
  lastFocus = document.activeElement;
  showImage(index);
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add("is-open"));
  document.body.classList.add("no-scroll");
  lightbox.querySelector(".lightbox__close").focus();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
  setTimeout(() => { lightbox.hidden = true; }, 300);
  if (lastFocus) lastFocus.focus();
}

galleryImgs.forEach((img, i) => {
  img.closest(".gallery__item").addEventListener("click", () => openLightbox(i));
});
lightbox.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", () => showImage(current - 1));
lightbox.querySelector(".lightbox__nav--next").addEventListener("click", () => showImage(current + 1));
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showImage(current - 1);
  if (e.key === "ArrowRight") showImage(current + 1);
});

// свайп на телефоне
let touchX = null;
lightbox.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) showImage(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

/* =========================================================
   Форма (пока без отправки)
   ========================================================= */
const form = document.getElementById("order-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  let valid = true;
  form.querySelectorAll("[required]").forEach((field) => {
    const ok = field.value.trim() !== "";
    field.classList.toggle("is-invalid", !ok);
    if (!ok) valid = false;
  });
  if (!valid) {
    alert("Пожалуйста, заполните имя, телефон и выберите услугу.");
    return;
  }
  // TODO: здесь будет отправка (Telegram-бот, Formspree, почта и т. п.)
  alert("Заявка отправлена");
  form.reset();
});
form.addEventListener("input", (e) => e.target.classList.remove("is-invalid"));
