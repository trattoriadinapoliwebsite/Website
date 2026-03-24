export async function loadHeader() {
  const el = document.getElementById('header');
  const res = await fetch('./partials/header.html');
  el.innerHTML = await res.text();

  initSpecialBanner();
}

function initSpecialBanner() {
  const specialsByDay = {
    0: "Sorry, we're closed today. You can still submit catering requests or make future reservations online.",
    1: "Sorry, we're closed today. You can still submit catering requests or make future reservations online.",
    2: "Join us for Veal Night! Enjoy your favorite pastas prepared with veal.",
    3: "Join us for Pizza Night! Hand-tossed pizza and wine pairings.",
    4: "Join us for Steak Night! Juicy steaks cooked to perfection.",
    5: "Join us for dinner tonight. Call us or reserve online.",
    6: "Join us for dinner tonight. Call us or reserve online."
  };

  const today = new Date().getDay();
  const specialEl = document.getElementById("special-text");
  const track = document.getElementById("slide-track");

  if (specialEl && specialsByDay[today]) {
    specialEl.textContent = specialsByDay[today];
  }

  if (track) {
    track.innerHTML += track.innerHTML;
  }
}
