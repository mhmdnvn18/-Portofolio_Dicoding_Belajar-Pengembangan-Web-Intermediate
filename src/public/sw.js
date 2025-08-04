// File: src/public/sw.js

const CACHE_NAME = 'laporan-v2'; // Versi cache diperbarui
const urlsToCache = [
  '/',
  '/app.bundle.js',
  '/index.html', // Tambahkan index.html
  // Pastikan path ke assets publik sudah benar
  '/images/logo.png',
  '/images/placeholder-image.jpg',
  '/favicon.png',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Aktifkan SW baru segera
      .catch((error) => {
        console.error('Service Worker: Caching failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      ).then(() => self.clients.claim()); // Ambil kontrol halaman segera
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Hanya tangani http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Strategi: Network First untuk API
  if (event.request.url.includes('story-api.dicoding.dev')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone respons untuk disimpan di cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(async () => {
          // Jika gagal, coba ambil dari cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Jika tidak ada di cache, kembalikan error
          return new Response(JSON.stringify({ message: 'Offline dan tidak ada data di cache.' }), {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'application/json' })
          });
        })
    );
    return;
  }
  
  // Strategi: Cache First untuk asset lainnya
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Jika ada di cache, kembalikan
        if (cachedResponse) {
          return cachedResponse;
        }

        // Jika tidak, ambil dari network
        return fetch(event.request).then((networkResponse) => {
          // Simpan respons network ke cache
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        });
      })
      .catch(() => {
        // Fallback jika network dan cache gagal
        if (event.request.destination === 'image') {
          return caches.match('/images/placeholder-image.jpg');
        }
        // Fallback untuk navigasi ke halaman utama
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
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