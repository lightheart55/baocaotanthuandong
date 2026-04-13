const CACHE_NAME = 'tyt-report-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Cài đặt Service Worker và lưu cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Phục vụ file từ cache nếu có, giúp app chạy nhanh hơn và có thể mở offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Trả về file từ cache
        }
        return fetch(event.request); // Tải từ mạng nếu chưa có trong cache
      })
  );
});

// Xóa cache cũ khi có phiên bản mới
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
