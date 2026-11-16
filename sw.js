/* Service worker sederhana: aset statis cache-dulu, halaman jaringan-dulu. Data GAS tidak pernah dicache di sini. */
const V = 'kurir-v2', ASET = ['./', 'index.html', 'css/style.css', 'js/config.js', 'js/core.js', 'js/demo.js', 'js/public.js', 'js/qr.js', 'assets/logo.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(ASET)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin || /\/admin\//.test(u.pathname)) return;
  if (e.request.mode === 'navigate' || /\.(js|css)$/.test(u.pathname)) {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
  } else e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
