// UniCom CX Service Worker – Cache-First مع إشعارات Push

const CACHE_NAME = 'unicom-cx-v1';

// تثبيت
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// تفعيل
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// استراتيجية Cache-First
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return new Response('لا يوجد اتصال', { status: 503 });
        });
    })
  );
});

// Push Notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  const payload = event.data.json();
  const options = {
    body: payload.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: { url: payload.url || '/dashboard/inbox' },
  };
  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/dashboard/inbox';
  event.waitUntil(clients.openWindow(url));
});