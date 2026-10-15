// Cima Blanca: service worker mínimo. No guarda nada en caché a propósito:
// los datos financieros siempre se leen en vivo y las actualizaciones llegan al instante.
self.addEventListener("install", function () { self.skipWaiting(); });
self.addEventListener("activate", function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener("fetch", function () { /* pasa directo a la red */ });
