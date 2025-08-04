// File: src/public/sw.js

const CACHE_NAME = 'laporan-v3'; // Versi cache diperbarui
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html', // Tambahkan halaman offline ke cache
  '/app.bundle.js',
  '/vendors.bundle.js', // Tambahkan file vendor
  '/images/logo.png',
  '/images/placeholder-image.jpg',
  '/favicon.png',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(
      cacheNames.map((cacheName) => {
        if (cacheName !== CACHE_NAME) {
          return caches.delete(cacheName);
        }
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  // Strategi: Stale While Revalidate untuk API
  if (event.request.url.includes('story-api.dicoding.dev')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        const fetchedResponsePromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return cachedResponse || fetchedResponsePromise;
      })
    );
    return;
  }
  
  // Strategi: Cache First untuk asset lainnya
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request);
      })
      .catch(async () => {
        // Fallback jika network dan cache gagal
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html');
        }
        if (event.request.destination === 'image') {
          return caches.match('/images/placeholder-image.jpg');
        }
        return new Response("Konten tidak tersedia secara offline.", {
          status: 404,
          statusText: "Not Found"
        });
      })
  );
});


// Push notification event
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received');
  
  let notificationData = {};
  
  if (event.data) {
    try {
      notificationData = event.data.json();
    } catch (error) {
      notificationData = {
        title: 'Laporan',
        body: event.data.text() || 'Ada laporan baru untuk Anda!',
        icon: '/favicon.png',
        badge: '/favicon.png',
        data: {
          url: '/'
        }
      };
    }
  } else {
    notificationData = {
      title: 'Laporan',
      body: 'Ada laporan baru untuk Anda!',
      icon: '/favicon.png',
      badge: '/favicon.png',
      data: {
        url: '/'
      }
    };
  }

  const options = {
    title: notificationData.title || 'Laporan',
    body: notificationData.body || 'Ada laporan baru untuk Anda!',
    icon: notificationData.icon || '/favicon.png',
    badge: notificationData.badge || '/favicon.png',
    vibrate: [100, 50, 100],
    data: notificationData.data || { url: '/' },
    actions: [
      {
        action: 'open',
        title: 'Buka Aplikasi',
        icon: '/favicon.png'
      },
      {
        action: 'close',
        title: 'Tutup'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window/tab
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});