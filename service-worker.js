self.addEventListener("install", e => {
  console.log("Service Worker instalado");
});

self.addEventListener("fetch", event => {
  // no cacheamos el stream para evitar problemas
});