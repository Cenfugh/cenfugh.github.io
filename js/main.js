/* =========================================================
   褚峰 个人主页脚本
   语言切换 / 移动端导航 / 滚动浮现 / 灯箱 / 滚动高亮
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 语言切换 / Language toggle ---------- */
  var html = document.documentElement;
  var langToggle = document.getElementById("lang-toggle");

  function setLang(lang) {
    html.lang = lang;
    try {
      localStorage.setItem("site-lang", lang);
    } catch (e) {
      /* ignore storage errors */
    }
  }

  function initLang() {
    var saved = null;
    try {
      saved = localStorage.getItem("site-lang");
    } catch (e) {
      /* ignore */
    }
    if (saved === "zh" || saved === "en") {
      html.lang = saved;
    } else {
      html.lang = "zh";
    }
  }

  if (langToggle) {
    langToggle.addEventListener("click", function () {
      setLang(html.lang === "zh" ? "en" : "zh");
    });
  }

  /* ---------- 移动端导航 / Mobile nav ---------- */
  var menuToggle = document.getElementById("menu-toggle");
  var siteNav = document.getElementById("site-nav");

  function closeMenu() {
    if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");
    if (siteNav) siteNav.classList.remove("open");
  }

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
    });

    siteNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeMenu();
    });
  }

  /* ---------- 滚动浮现动画 / Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- 导航高亮 / Scrollspy ---------- */
  var sections = document.querySelectorAll("main section[id]");
  var navLinks = document.querySelectorAll(".nav-link");

  function highlightNav() {
    var scrollPos = window.scrollY + 120;
    var current = "";
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) current = section.id;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.getAttribute("href") === "#" + current);
    });
  }

  if (sections.length && navLinks.length) {
    window.addEventListener("scroll", highlightNav, { passive: true });
    highlightNav();
  }

  /* ---------- 灯箱 / Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightbox-img");
  var lightboxCaption = document.getElementById("lightbox-caption");
  var lightboxClose = document.getElementById("lightbox-close");
  var lightboxSpinner = document.getElementById("lightbox-spinner");

  function openLightbox(src, caption) {
    if (!lightbox) return;

    // 立即隐藏旧图并显示加载动画（无过渡，杜绝闪现上一次的图片）
    lightboxImg.classList.add("is-loading");
    if (lightboxSpinner) lightboxSpinner.classList.add("active");
    lightboxCaption.textContent = caption || "";

    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    // 用独立的 Image 对象预加载原图，加载完成后再替换到灯箱，
    // 保证在“新图就绪”之前，灯箱里始终只有加载动画、绝不显示旧图
    var preload = new Image();
    preload.onload = function () {
      lightboxImg.src = src;
      lightboxImg.alt = caption || "";
      // 等浏览器完成解码与绘制后，再淡入新图
      requestAnimationFrame(function () {
        lightboxImg.classList.remove("is-loading");
        if (lightboxSpinner) lightboxSpinner.classList.remove("active");
      });
    };
    preload.onerror = function () {
      lightboxImg.classList.remove("is-loading");
      if (lightboxSpinner) lightboxSpinner.classList.remove("active");
    };
    preload.src = src;
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".photo-item").forEach(function (item) {
    item.addEventListener("click", function () {
      var img = item.querySelector("img");
      if (!img) return;
      // 优先使用 data-full 指向的原图；未设置时回退到缩略图本身
      var full = item.getAttribute("data-full");
      var src = full || img.src;
      openLightbox(src, item.getAttribute("data-caption") || "");
    });
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- 页脚年份 / Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- 初始化 / Init ---------- */
  initLang();
})();
