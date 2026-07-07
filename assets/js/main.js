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
  const chatbotLanguage = document.querySelector("[data-chatbot-language]");
  const chatbotVoiceToggle = document.querySelector("[data-chatbot-voice]");
  const chatbotMic = document.querySelector("[data-chatbot-mic]");
  const chatQuestionButtons = document.querySelectorAll("[data-chat-question]");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let recognition = null;
  let isListening = false;
  let voiceEnabled = true;

  const languageOptions = {
    en: {
      speech: "en-US",
      placeholder: "Type your question...",
      thinking: "Thinking...",
      listening: "Listening...",
      voiceOn: "Voice on",
      voiceOff: "Voice off",
      unsupportedVoice: "Voice input is not supported in this browser. Please type your question.",
    },
    sw: {
      speech: "sw-KE",
      placeholder: "Andika swali lako...",
      thinking: "Nafikiria...",
      listening: "Nasikiliza...",
      voiceOn: "Sauti ipo",
      voiceOff: "Sauti imezimwa",
      unsupportedVoice: "Kipaza sauti hakitumiki kwenye kivinjari hiki. Tafadhali andika swali lako.",
    },
  };

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

  function selectedChatLanguage() {
    if (!chatbotLanguage || !languageOptions[chatbotLanguage.value]) return "en";
    return chatbotLanguage.value;
  }

  function currentLanguageOption() {
    return languageOptions[selectedChatLanguage()];
  }

  function getLocalAssistantResponse(question) {
    const text = normalizeQuestion(question);
    const language = selectedChatLanguage();

    if (!text) {
      return language === "sw"
        ? "Tafadhali andika au sema swali kuhusu huduma, mafunzo, ada, vifaa, au kuwasiliana na Jared."
        : "Please type or speak a question about services, training, fees, equipment, or contacting Jared.";
    }

    if (includesAny(text, ["contact", "call", "phone", "whatsapp", "reach", "talk", "message", "wasiliana", "simu"])) {
      if (language === "sw") {
        return "Unaweza kuwasiliana na Jared kupitia fomu ya tovuti au WhatsApp kwa +254 798 736972. Kwa maswali ya haraka ya kiufundi, WhatsApp ni njia rahisi zaidi.";
      }
      return "You can contact Jared through the contact form on this site or WhatsApp at +254 798 736972. For urgent technical inquiries, WhatsApp is the fastest option.";
    }

    if (includesAny(text, ["fee", "fees", "price", "cost", "payment", "how much", "ksh", "ada", "bei", "malipo"])) {
      if (language === "sw") {
        return "Ada ya kila kifurushi cha mafunzo kilichoorodheshwa ni KSh 2,000: Technical Drawing and Mining Software, Mine Pit Design and Mine Planning, na Drilling and Blasting Engineering.";
      }
      return "The listed professional training packages are KSh 2,000 each: Technical Drawing and Mining Software, Mine Pit Design and Mine Planning, and Drilling and Blasting Engineering.";
    }

    if (includesAny(text, ["training", "course", "learn", "student", "package", "classes", "mafunzo", "kozi", "mwanafunzi"])) {
      if (language === "sw") {
        return "JEA inatoa mafunzo ya vitendo kwenye technical drawing na mining software, mine pit design and mine planning, pamoja na drilling and blasting engineering. Mafunzo yanazingatia hesabu, templates, case studies, na project exercises.";
      }
      return "JEA offers practical training packages in technical drawing and mining software, mine pit design and mine planning, and drilling and blasting engineering. Each package focuses on real calculations, templates, case studies, and project exercises.";
    }

    if (includesAny(text, ["blast", "blasting", "drilling", "explosive", "explosives", "anfo", "fragmentation", "ulipuaji", "vilipuzi"])) {
      if (language === "sw") {
        return "Mafunzo ya drilling and blasting yanahusu drilling operations, blast design, burden na spacing, explosives, initiation systems, fragmentation, safety controls, reports, na quarry case studies. Maamuzi ya site yanahitaji ukaguzi wa mtaalamu.";
      }
      return "The drilling and blasting package covers drilling operations, blast design, burden and spacing calculations, explosives, initiation systems, fragmentation, safety controls, reports, and quarry case studies. Final site decisions should be reviewed by a qualified professional.";
    }

    if (includesAny(text, ["pit", "mine planning", "haul", "road", "stockpile", "waste dump", "slope", "bench", "mgodi", "barabara"])) {
      if (language === "sw") {
        return "Mafunzo ya mine pit design and mine planning yanahusu pit geometry, benches, berms, haul roads, stockpiles, waste dumps, slope stability, scheduling, volume calculations, na final pit presentation.";
      }
      return "The mine pit design and mine planning package covers pit geometry, benches, berms, haul roads, stockpiles, waste dumps, slope stability, scheduling, volume calculations, and final pit presentation.";
    }

    if (includesAny(text, ["autocad", "inventor", "surpac", "drawing", "software", "cad", "model", "design", "michoro"])) {
      if (language === "sw") {
        return "Kifurushi cha technical drawing kinahusu engineering drawing fundamentals, AutoCAD 2D na 3D, Autodesk Inventor, Surpac mine design, quarry layouts, plant layouts, na complete engineering design project.";
      }
      return "The technical drawing package covers engineering drawing fundamentals, AutoCAD 2D and 3D, Autodesk Inventor, Surpac mine design, quarry layouts, plant layouts, and a complete engineering design project.";
    }

    if (includesAny(text, ["crusher", "maintenance", "jaw", "cone", "screen", "conveyor", "downtime", "plant", "matengenezo", "kiwanda"])) {
      if (language === "sw") {
        return "JEA husaidia matengenezo ya jaw crushers, cone crushers, vibrating screens, na conveyors kupitia inspections, troubleshooting, failure analysis, downtime reduction, na plant reliability improvement.";
      }
      return "JEA supports crusher maintenance for jaw crushers, cone crushers, vibrating screens, and conveyors, including inspections, troubleshooting, failure analysis, downtime reduction, and plant reliability improvement.";
    }

    if (includesAny(text, ["service", "services", "offer", "consultancy", "consulting", "what do you do", "huduma"])) {
      if (language === "sw") {
        return "JEA Consultancy Firm hutoa huduma za mining and mineral processing engineering, kama crushing plant design, pit design and optimization, crusher maintenance, production improvement, technical drawing, na professional training packages.";
      }
      return "JEA Consultancy Firm provides mining and mineral processing engineering support, including crushing plant design, pit design and optimization, crusher maintenance, production improvement, technical drawing, and professional training packages.";
    }

    if (includesAny(text, ["jared", "etaba", "engineer", "ceo", "uppa", "about"])) {
      if (language === "sw") {
        return "Jared Etaba ni Mining and Mineral Processing Engineer na pia ni CEO wa UPPA. Tovuti hii inaonyesha huduma zake za mining consultancy, mafunzo, na engineering support.";
      }
      return "Jared Etaba is a Mining and Mineral Processing Engineer and also serves as CEO at UPPA. This site presents his mining consultancy, training, and engineering support services.";
    }

    return language === "sw"
      ? "Naweza kusaidia kwa maswali kuhusu huduma za JEA, mafunzo, ada, crusher maintenance, pit design, drilling and blasting, technical drawing, au namna ya kuwasiliana na Jared. Kwa jibu la kina la site, tafadhali wasiliana na Jared moja kwa moja."
      : "I can help with common questions about JEA services, training packages, fees, crusher maintenance, pit design, drilling and blasting, technical drawing, or how to contact Jared. For a detailed site-specific answer, please contact Jared directly.";
  }

  function appendChatMessage(message, type) {
    if (!chatbotMessages) return null;

    const messageElement = document.createElement("div");
    messageElement.className = "chat-message " + (type === "user" ? "user-message" : "bot-message");
    messageElement.textContent = message;
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return messageElement;
  }

  function getCsrfToken() {
    if (!chatbotForm) return "";
    const csrfInput = chatbotForm.querySelector("input[name='csrfmiddlewaretoken']");
    if (csrfInput) return csrfInput.value;

    const csrfCookie = document.cookie
      .split("; ")
      .find(function (cookie) {
        return cookie.startsWith("csrftoken=");
      });
    return csrfCookie ? decodeURIComponent(csrfCookie.split("=")[1]) : "";
  }

  async function getApiAssistantResponse(question) {
    if (!chatbotForm || !chatbotForm.action) {
      return getLocalAssistantResponse(question);
    }

    const response = await fetch(chatbotForm.action, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCsrfToken(),
      },
      body: JSON.stringify({
        question: question,
        language: selectedChatLanguage(),
      }),
    });

    const data = await response.json().catch(function () {
      return {};
    });

    if (data.answer) return data.answer;
    if (!response.ok) return getLocalAssistantResponse(question);
    return getLocalAssistantResponse(question);
  }

  function speakText(message) {
    if (!voiceEnabled || !("speechSynthesis" in window) || !message) return;

    const config = currentLanguageOption();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = config.speech;

    const voices = window.speechSynthesis.getVoices();
    const languagePrefix = config.speech.split("-")[0];
    const matchingVoice = voices.find(function (voice) {
      return voice.lang && voice.lang.toLowerCase().startsWith(languagePrefix);
    });

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function updateChatbotLanguageUi() {
    if (!chatbotInput || !chatbotVoiceToggle) return;

    const config = currentLanguageOption();
    chatbotInput.placeholder = config.placeholder;
    chatbotVoiceToggle.textContent = voiceEnabled ? config.voiceOn : config.voiceOff;
  }

  function setListeningState(active) {
    isListening = active;
    if (!chatbotMic) return;
    chatbotMic.classList.toggle("is-listening", active);
    chatbotMic.setAttribute("aria-label", active ? currentLanguageOption().listening : "Speak your question");
  }

  function getSpeechRecognition() {
    if (!SpeechRecognition) return null;

    if (!recognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.addEventListener("start", function () {
        setListeningState(true);
      });

      recognition.addEventListener("end", function () {
        setListeningState(false);
      });

      recognition.addEventListener("error", function () {
        setListeningState(false);
        appendChatMessage(currentLanguageOption().unsupportedVoice, "bot");
      });

      recognition.addEventListener("result", function (event) {
        const transcript = Array.from(event.results)
          .map(function (result) {
            return result[0].transcript;
          })
          .join(" ")
          .trim();

        if (transcript) {
          if (chatbotInput) chatbotInput.value = transcript;
          askAssistant(transcript);
        }
      });
    }

    recognition.lang = currentLanguageOption().speech;
    return recognition;
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

  async function askAssistant(question) {
    appendChatMessage(question, "user");
    const thinkingMessage = appendChatMessage(currentLanguageOption().thinking, "bot");

    try {
      const answer = await getApiAssistantResponse(question);
      if (thinkingMessage) {
        thinkingMessage.textContent = answer;
      } else {
        appendChatMessage(answer, "bot");
      }
      speakText(answer);
    } catch (error) {
      const fallbackAnswer = getLocalAssistantResponse(question);
      if (thinkingMessage) {
        thinkingMessage.textContent = fallbackAnswer;
      } else {
        appendChatMessage(fallbackAnswer, "bot");
      }
      speakText(fallbackAnswer);
    }
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

    if (chatbotLanguage) {
      chatbotLanguage.addEventListener("change", function () {
        updateChatbotLanguageUi();
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      });
    }

    if (chatbotVoiceToggle) {
      chatbotVoiceToggle.addEventListener("click", function () {
        voiceEnabled = !voiceEnabled;
        chatbotVoiceToggle.setAttribute("aria-pressed", String(voiceEnabled));
        if (!voiceEnabled && "speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
        updateChatbotLanguageUi();
      });
    }

    if (chatbotMic) {
      chatbotMic.addEventListener("click", function () {
        openChatbot();
        const speechRecognition = getSpeechRecognition();

        if (!speechRecognition) {
          appendChatMessage(currentLanguageOption().unsupportedVoice, "bot");
          return;
        }

        if (isListening) {
          speechRecognition.stop();
          return;
        }

        try {
          speechRecognition.start();
        } catch (error) {
          appendChatMessage(currentLanguageOption().unsupportedVoice, "bot");
        }
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !chatbotPanel.hidden) {
        closeChatbot();
      }
    });

    updateChatbotLanguageUi();
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
