// Offline support. Bump CACHE_VERSION whenever you change the files below so
// installed copies pick up the update.
var CACHE_VERSION = 'descent-proof-v2';
var ASSETS = [
  './', './index.html', './css/styles.css', './js/app.js', './js/info.js',
  './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
  './icons/apple-touch-icon.png', './icons/favicon-32.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE_VERSION).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE_VERSION; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// stale-while-revalidate for our own files; everything else (e.g. YouTube links) goes straight to the network
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        var fresh = fetch(req).then(function (res) {
          if (res && res.ok) cache.put(req, res.clone());
          return res;
        }).catch(function () { return hit || cache.match('./index.html'); });
        return hit || fresh;
      });
    })
  );
});
