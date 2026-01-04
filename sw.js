self.addEventListener("install", e => {
    e.waitUntil(
        caches.open("santosh-cache").then(cache => {
            return cache.addAll([
                "./",
                "./index.html",
                "./style.css",
                "./script.js",
                "./assets/logo.png"
            ]);
        })
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(res => res || fetch(e.request))
    );
});
