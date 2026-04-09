// =========================
// LOAD FOOTER PARTIAL
// =========================

export async function loadFooter() {
  const res = await fetch("partials/footer.html");
  const html = await res.text();
  document.getElementById("footer-root").innerHTML = html;

  initFooter();
}

// =========================
// INIT ALL FOOTER FEATURES
// =========================

function initFooter() {
  initChat();
  initPopup();
}

// =========================
// CHAT WIDGET
// =========================

function initChat() {
  const widget = document.getElementById("chat-widget");
  const toggle = document.getElementById("chat-toggle");
  const closeBtn = document.getElementById("chat-close");
  const sendBtn = document.getElementById("sendBtn");
  const userInput = document.getElementById("userInput");
  const chatBody = document.getElementById("chatbot-body");
  const liveBtn = document.getElementById("live-agent-btn");
  const returnBtn = document.getElementById("return-to-bot");

  if (!widget) return;

  // =========================
  // TOGGLE
  // =========================
  toggle.onclick = () => widget.classList.add("open");
  closeBtn.onclick = () => widget.classList.remove("open");

  // =========================
  // MESSAGE RENDER
  // =========================
  function addMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = `message ${sender}`;
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // =========================
  // NLP LAYER (RESTORED)
  // =========================
  function normalize(input) {
    return input
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/([a-z])\1{2,}/g, "$1")
      .trim();
  }

  function fuzzyMatch(msg, root) {
    const pattern = new RegExp(root.split("").join(".{0,2}"), "i");
    return pattern.test(msg);
  }

  function comboMatch(msg, keywords) {
    return keywords.every((word) => fuzzyMatch(msg, word));
  }

  function ask(msg, patterns) {
    for (let p of patterns) {
      if (Array.isArray(p) && comboMatch(msg, p)) return true;
    }
    return patterns.some((p) => typeof p === "string" && fuzzyMatch(msg, p));
  }

  // =========================
  // RESPONSE ENGINE (FULL)
  // =========================
  function getResponse(input) {
    const msg = normalize(input);

    if (ask(msg, [["menu", "vegetarian"], ["menu", "vegan"], ["vegetarian"], ["veggie"], ["vegan"]]))
      return ["We offer vegetarian pizza, salads, and pasta dishes - plenty to enjoy!"];

    if (ask(msg, [["reservation"], ["book", "table"], "reserve", "booking"]))
      return [
        "Reservations aren't required, but you can make one online or by calling us.",
        "We do recommend it during busy hours!"
      ];

    if (ask(msg, [["dress"], ["attire"], "clothes"]))
      return ["No dress code here — come as you are!"];

    if (ask(msg, [["hours"], ["open", "time"], ["closing"], ["today", "hours"], ["close", "time"]]))
      return [
        "We're open Tue–Thu 11 AM – 9 PM, Fri/Sat 11 AM – 10 PM.",
        "Closed Sunday & Monday."
      ];

    if (ask(msg, [["location"], ["where"], ["address"], ["directions"], ["map"]]))
      return ["We’re located in Perry, GA — at 904 Commerce Street!"];

    if (ask(msg, [["gluten"], ["celiac"], ["gf"]]))
      return [
        "We have gluten-free pasta, salads, and non-breaded protein options.",
        "Just let your server know when you order."
      ];

    if (ask(msg, [["allergy"], ["nuts"], ["dairy"], ["shellfish"]]))
      return ["We do our best to accommodate allergies — please inform your server when you arrive."];

    if (ask(msg, [["menu"], ["food"], ["dishes"], ["lunch"], ["dinner"], ["special"], ["chef"]]))
      return [
        "We have separate menus for lunch and dinner!",
        "You can view both using the links at the top of our website."
      ];

    if (ask(msg, [["delivery"], ["takeout"], ["carryout"]]))
      return [
        "We don’t offer delivery — sorry about that.",
        "But you can place takeout orders online or by phone anytime during business hours."
      ];

    if (ask(msg, [["gift"], ["card"], ["certificate"]]))
      return ["Gift cards can be purchased in person or by phone."];

    if (ask(msg, [["cater"], ["event"], ["party"], ["wedding"], ["banquet"], ["large", "order"]]))
      return [
        "We cater events and private parties!",
        "Requests can be made online, by phone, or by email.",
        "Please note a 50% deposit is required to confirm."
      ];

    if (ask(msg, [["payment"], ["credit"], ["card"], ["apple pay"], ["cash"], ["visa"], ["mastercard"]]))
      return ["We accept all major credit cards, cash, and contactless payments like Apple Pay."];

    if (ask(msg, [["kids"], ["children"], ["family"], ["child menu"]]))
      return ["We’re family-friendly and offer kid-sized portions for select dishes!"];

    if (ask(msg, [["human"], ["person"], ["representative"], ["staff"]]))
      return ["You can reach our staff instantly using the live chat button below."];

    return [
      "I'm not sure about that one.",
      "But I can connect you with our team if you'd like!"
    ];
  }

  // =========================
  // SEND FLOW (MULTI MESSAGE)
  // =========================
  function handleSend() {
    const input = userInput.value.trim();
    if (!input) return;

    addMessage("user", input);
    userInput.value = "";

    const responses = getResponse(input);

    let i = 0;

    function sendNext() {
      if (i >= responses.length) return;

      setTimeout(() => {
        addMessage("bot", responses[i]);
        i++;
        sendNext();
      }, 500 + responses[i].length * 15);
    }

    sendNext();
  }

  sendBtn.onclick = handleSend;
  userInput.addEventListener("keypress", e => {
    if (e.key === "Enter") handleSend();
  });

  // =========================
  // TRANSCRIPT
  // =========================
  function getChatTranscript() {
    return Array.from(document.querySelectorAll(".message"))
      .map(m => `${m.classList.contains("user") ? "User" : "Bot"}: ${m.textContent}`)
      .join("\n");
  }

  // =========================
  // LIVE CHAT
  // =========================
  function loadLiveChat(transcript) {
    if (window.__liveChatLoaded) {
      openLiveChat();
      return;
    }

    window._support = window._support || { ui: {}, user: {} };

    _support.account = "18c313a9-b214-4bfa-a32f-c6ea361943d6";
    _support.ui.contactMode = "mixed";
    _support.ui.mailbox = "65081234";

    _support.ticket = {
      subject: "Chat Escalation",
      message: transcript
    };

    const script = document.createElement("script");
    script.src = "https://cdn.reamaze.com/assets/reamaze-loader.js";
    script.async = true;

    script.onload = () => {
      window.__liveChatLoaded = true;

      widget.classList.add("minimized");
      returnBtn.style.display = "block";

      setTimeout(openLiveChat, 500);
    };

    document.body.appendChild(script);
  }

  function openLiveChat() {
    let attempts = 0;

    const interval = setInterval(() => {
      if (window.Reamaze) {
        window.Reamaze("open");
        clearInterval(interval);
      }
      if (++attempts > 10) clearInterval(interval);
    }, 200);
  }

  // =========================
  // BUTTONS
  // =========================
  liveBtn.onclick = () => {
    addMessage("bot", "Connecting you to a team member...");
    loadLiveChat(getChatTranscript());
  };

  returnBtn.onclick = () => {
    widget.classList.remove("minimized");
    returnBtn.style.display = "none";

    if (window.Reamaze) {
      window.Reamaze("close");
    }
  };

  // =========================
  // GREETING
  // =========================
  setTimeout(() => {
    addMessage("bot", "Ciao! How can I help?");
  }, 800);
}
// =========================
// HOMEPAGE POPUP
// =========================
function initPopup() {
  const popup = document.getElementById("event-popup");
  if (!popup) return;

  const img = popup.querySelector("img");
  const closeBtn = document.getElementById("popup-close");

  // =========================
  // HARD EXIT CONDITIONS
  // =========================

  // No image element at all → remove popup entirely
  if (!img) {
    popup.remove();
    return;
  }

  // Image exists but has no valid src → remove popup
  if (!img.getAttribute("src") || img.getAttribute("src").trim() === "") {
    popup.remove();
    return;
  }

  // =========================
  // WAIT FOR IMAGE VALIDATION
  // =========================

  img.onload = () => {
    // Only show AFTER image successfully loads
    popup.style.display = "flex";
  };

  img.onerror = () => {
    // Broken image → remove popup
    popup.remove();
  };

  // =========================
  // CLOSE HANDLER
  // =========================

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      popup.style.display = "none";
    });
  }
}
