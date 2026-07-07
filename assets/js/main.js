(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const body = document.body;
  const header = document.querySelector("#header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav-links a");
  const scrollTop = document.querySelector(".scroll-top");
  const chatbot = document.querySelector("[data-chatbot]");
  const chatbotToggle = document.querySelector(".chatbot-toggle");
  const chatbotPanel = document.querySelector(".chatbot-panel");
  const chatbotClose = document.querySelector(".chatbot-close");
  const chatbotMessages = document.querySelector("[data-chatbot-messages]");
  const chatbotForm = document.querySelector("[data-chatbot-form]");
  const chatbotInput = document.querySelector("#chatbot-input");
  const chatQuestionButtons = document.querySelectorAll("[data-chat-question]");

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

  function normalizeQuestion(question) {
    return question.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }

  function includesAny(text, words) {
    return words.some(function (word) {
      return text.includes(word);
    });
  }

  function getAssistantResponse(question) {
    const text = normalizeQuestion(question);

    if (!text) {
      return "Please type a question about services, training, fees, equipment, or contacting Jared.";
    }

    if (includesAny(text, ["contact", "call", "phone", "whatsapp", "reach", "talk", "message"])) {
      return "You can contact Jared through the contact form on this site or WhatsApp at +254 798 736972. For urgent technical inquiries, WhatsApp is the fastest option.";
    }

    if (includesAny(text, ["fee", "fees", "price", "cost", "payment", "how much", "ksh"])) {
      return "The listed professional training packages are KSh 2,000 each: Technical Drawing and Mining Software, Mine Pit Design and Mine Planning, and Drilling and Blasting Engineering.";
    }

    if (includesAny(text, ["training", "course", "learn", "student", "package", "classes"])) {
      return "JEA offers practical training packages in technical drawing and mining software, mine pit design and mine planning, and drilling and blasting engineering. Each package focuses on real calculations, templates, case studies, and project exercises.";
    }

    if (includesAny(text, ["blast", "blasting", "drilling", "explosive", "explosives", "anfo", "fragmentation"])) {
      return "The drilling and blasting package covers drilling operations, blast design, burden and spacing calculations, explosives, initiation systems, fragmentation, safety controls, reports, and quarry case studies. Final site decisions should be reviewed by a qualified professional.";
    }

    if (includesAny(text, ["pit", "mine planning", "haul", "road", "stockpile", "waste dump", "slope", "bench"])) {
      return "The mine pit design and mine planning package covers pit geometry, benches, berms, haul roads, stockpiles, waste dumps, slope stability, scheduling, volume calculations, and final pit presentation.";
    }

    if (includesAny(text, ["autocad", "inventor", "surpac", "drawing", "software", "cad", "model", "design"])) {
      return "The technical drawing package covers engineering drawing fundamentals, AutoCAD 2D and 3D, Autodesk Inventor, Surpac mine design, quarry layouts, plant layouts, and a complete engineering design project.";
    }

    if (includesAny(text, ["crusher", "maintenance", "jaw", "cone", "screen", "conveyor", "downtime", "plant"])) {
      return "JEA supports crusher maintenance for jaw crushers, cone crushers, vibrating screens, and conveyors, including inspections, troubleshooting, failure analysis, downtime reduction, and plant reliability improvement.";
    }

    if (includesAny(text, ["service", "services", "offer", "consultancy", "consulting", "what do you do"])) {
      return "JEA Consultancy Firm provides mining and mineral processing engineering support, including crushing plant design, pit design and optimization, crusher maintenance, production improvement, technical drawing, and professional training packages.";
    }

    if (includesAny(text, ["jared", "etaba", "engineer", "ceo", "uppa", "about"])) {
      return "Jared Etaba is a Mining and Mineral Processing Engineer and also serves as CEO at UPPA. This site presents his mining consultancy, training, and engineering support services.";
    }

    return "I can help with common questions about JEA services, training packages, fees, crusher maintenance, pit design, drilling and blasting, technical drawing, or how to contact Jared. For a detailed site-specific answer, please contact Jared directly.";
  }

  function appendChatMessage(message, type) {
    if (!chatbotMessages) return;

    const messageElement = document.createElement("div");
    messageElement.className = "chat-message " + (type === "user" ? "user-message" : "bot-message");
    messageElement.textContent = message;
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  }

  function openChatbot() {
    if (!chatbotPanel || !chatbotToggle) return;
    chatbotPanel.hidden = false;
    chatbotToggle.setAttribute("aria-expanded", "true");
    if (chatbotInput) {
      window.setTimeout(function () {
        chatbotInput.focus();
      }, 80);
    }
  }

  function closeChatbot() {
    if (!chatbotPanel || !chatbotToggle) return;
    chatbotPanel.hidden = true;
    chatbotToggle.setAttribute("aria-expanded", "false");
    chatbotToggle.focus();
  }

  function askAssistant(question) {
    appendChatMessage(question, "user");
    window.setTimeout(function () {
      appendChatMessage(getAssistantResponse(question), "bot");
    }, 180);
  }

  if (chatbot && chatbotToggle && chatbotPanel) {
    chatbotToggle.addEventListener("click", function () {
      if (chatbotPanel.hidden) {
        openChatbot();
      } else {
        closeChatbot();
      }
    });

    if (chatbotClose) {
      chatbotClose.addEventListener("click", closeChatbot);
    }

    chatQuestionButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        openChatbot();
        askAssistant(button.dataset.chatQuestion);
      });
    });

    if (chatbotForm && chatbotInput) {
      chatbotForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const question = chatbotInput.value.trim();
        if (!question) return;

        chatbotInput.value = "";
        askAssistant(question);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !chatbotPanel.hidden) {
        closeChatbot();
      }
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
