const btn = document.getElementById("playBtn");
const audio = document.getElementById("radio");
const statusDot = document.querySelector(".live-dot");
const statusText = document.getElementById("statusText");
const statusMsg = document.getElementById("statusMsg");
const card = document.querySelector(".card");

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
    setState("off");
  }
});

audio.addEventListener("waiting", () => setState("buffer"));
audio.addEventListener("playing", () => setState("live"));
audio.addEventListener("pause", () => setState("off"));
audio.addEventListener("error", () => setState("off"));

setState("off");
let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.style.display = "block";
});

installBtn.addEventListener("click", async () => {
  installBtn.style.display = "none";
  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    console.log("App instalada");
  } else {
    console.log("Instalación cancelada");
  }

  deferredPrompt = null;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js")
    .then(() => console.log("SW registrado"))
    .catch(err => console.log("SW error", err));
}

// METADATA ZENO
async function loadMetadata() {
  try {
    const res = await fetch("https://api.zeno.fm/mounts/metadata/subscribe/13k0quc5xhruv");
    const data = await res.json();

    if (data && data.streamTitle) {
      document.getElementById("nowPlaying").textContent =
        "🎶 " + data.streamTitle;
    }
  } catch (e) {
    document.getElementById("nowPlaying").textContent =
      "🎶 Transmisión en vivo";
  }
}

// actualizar cada 10 segundos
setInterval(loadMetadata, 10000);
loadMetadata();

async function loadListeners() {
  try {
    const res = await fetch("https://api.zeno.fm/mounts/13k0quc5xhruv");
    const data = await res.json();

    if (data && data.listeners !== undefined) {
      document.getElementById("listeners").textContent =
        "👥 Oyentes: " + data.listeners;
    }
  } catch {
    document.getElementById("listeners").textContent =
      "👥 Oyentes: --";
  }
}

setInterval(loadListeners, 15000);
loadListeners();
