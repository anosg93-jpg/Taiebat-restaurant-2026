const CACHE_NAME = 'taybat-menu-v2';
const assetsToCache = [
  'index.html',
  'manifest.json',
  'images/logotaybat.png'
];

// تثبيت الـ Service Worker وتخزين الملفات الأساسية
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
  self.skipWaiting();
});

// تفعيل وتطهير الكاش القديم إن وجد
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// استراتيجية الجلب: محاولة جلب البيانات من الشبكة أولاً، وإن لم تتوافر يتم جلبها من الـ Cache لضمان السرعة والعمل بدون إنترنت
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('docs.google.com')) {
    // جلب بيانات الشيت مباشرة من الشبكة لتحديث المنيو لحظياً
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      }).catch(() => {
        // صفحة احتياطية أو تجاهل في حال انقطاع الشبكة تماماً
      })
    );
  }
});
