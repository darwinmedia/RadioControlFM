const btn = document.getElementById("playBtn");
const audio = document.getElementById("radio");
const statusDot = document.querySelector(".live-dot");
const statusText = document.getElementById("statusText");
const statusMsg = document.getElementById("statusMsg");
const card = document.querySelector(".card");
const installBtn = document.getElementById("installBtn");
const volumeSlider = document.getElementById("volumeSlider");

let deferredPrompt;

/* =========================
   ESTADOS
========================= */
function setState(state) {
  if (state === "live") {
    statusDot.style.background = "lime";
    statusText.textContent = "EN VIVO";
    statusMsg.textContent = "Transmisión Estable";
    card.classList.add("playing");
  }

  if (state === "off") {
    statusDot.style.background = "red";
    statusText.textContent = "DETENIDO";
    statusMsg.textContent = "Listo para reproducir";
    card.classList.remove("playing");
  }

  if (state === "buffer") {
    statusDot.style.background = "orange";
    statusText.textContent = "CARGANDO...";
    statusMsg.textContent = "Cargando Transmisión...";
  }
}

/* =========================
   PLAY / PAUSE
========================= */
btn.addEventListener("click", async () => {
  try {
    if (audio.paused) {
      setState("buffer");
      await audio.play();
      btn.textContent = "⏸ Detener";
      setState("live");
    } else {
      audio.pause();
      btn.textContent = "▶ Escuchar";
      setState("off");
    }
  } catch (e) {
    console.log("Audio error:", e);
    setState("off");
  }
});

/* =========================
   EVENTOS AUDIO
========================= */
audio.addEventListener("waiting", () => setState("buffer"));
audio.addEventListener("playing", () => setState("live"));
audio.addEventListener("pause", () => setState("off"));
audio.addEventListener("error", () => setState("off"));

setState("off");

/* =========================
   VOLUMEN
========================= */
if (volumeSlider) {
  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });
}

/* =========================
   INSTALL APP
========================= */
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
});

installBtn.addEventListener("click", async () => {
  installBtn.style.display = "none";
  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;

  console.log(outcome === "accepted"
    ? "App instalada"
    : "Instalación cancelada"
  );

  deferredPrompt = null;
});

/* =========================
   SERVICE WORKER
========================= */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("SW registrado"))
    .catch(err => console.log("SW error", err));
}

/* =========================
   METADATA ZENO
========================= */
async function loadMetadata() {
  try {
    const res = await fetch("https://api.zeno.fm/mounts/metadata/subscribe/13k0quc5xhruv");
    const data = await res.json();

    document.getElementById("nowPlaying").textContent =
      data?.streamTitle ? "🎶 " + data.streamTitle : "🎶 Transmisión en vivo";

  } catch {
    document.getElementById("nowPlaying").textContent =
      "🎶 Transmisión en vivo";
  }
}

setInterval(loadMetadata, 10000);
loadMetadata();

/* =========================
   OYENTES
========================= */
async function loadListeners() {
  try {
    const res = await fetch("https://api.zeno.fm/mounts/13k0quc5xhruv");
    const data = await res.json();

    document.getElementById("listeners").textContent =
      "👥 Oyentes: " + (data?.listeners ?? "--");

  } catch {
    document.getElementById("listeners").textContent =
      "👥 Oyentes: --";
  }
}

setInterval(loadListeners, 15000);
loadListeners();
