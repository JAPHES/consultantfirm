(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const body = document.body;
  const header = document.querySelector("#header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav-links a");
  const scrollTop = document.querySelector(".scroll-top");

  function toggleHeaderState() {
    if (!header) return;
    body.classList.toggle("scrolled", window.scrollY > 20);
  }

  function closeNavigation() {
    body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.querySelector("i").className = "bi bi-list";
    }
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      const isOpen = body.classList.toggle("nav-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.querySelector("i").className = isOpen ? "bi bi-x-lg" : "bi bi-list";
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", closeNavigation);
  });

  function revealOnScroll() {
    const revealItems = document.querySelectorAll(".reveal");
    if (!revealItems.length) return;

    if (!("IntersectionObserver" in window)) {
      revealItems.forEach(function (item) {
        item.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  function toggleScrollTop() {
    if (!scrollTop) return;
    scrollTop.classList.toggle("active", window.scrollY > 400);
  }

  if (scrollTop) {
    scrollTop.addEventListener("click", function (event) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  function setActiveNav() {
    const sections = Array.from(document.querySelectorAll("main section[id]"));
    if (!sections.length) return;

    let activeId = sections[0].id;
    sections.forEach(function (section) {
      if (window.scrollY + 160 >= section.offsetTop) {
        activeId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      const hash = new URL(link.href, window.location.href).hash;
      link.classList.toggle("active", hash === "#" + activeId);
    });
  }

  window.addEventListener("scroll", function () {
    toggleHeaderState();
    toggleScrollTop();
    setActiveNav();
  }, { passive: true });

  window.addEventListener("load", function () {
    toggleHeaderState();
    toggleScrollTop();
    setActiveNav();
    revealOnScroll();
  });
})();
