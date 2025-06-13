const CACHE_NAME = 'laporan-v1';
const urlsToCache = [
  '/',
  '/app.bundle.js',
  '/styles.css',
  '/manifest.json',
  '/favicon.png',
  '/images/logo.png',
  '/images/placeholder-image.jpg',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Service Worker: Caching failed', error);
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
      );
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Only handle http(s) requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // Handle API requests (network first, then cache)
  if (event.request.url.includes('story-api.dicoding.dev')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          
          // Cache the fresh response
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((err) => console.error('Failed to cache API response:', err));
          
          return response;
        })
        .catch(async () => {
          // If offline, try to serve from cache
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // If no cached data, throw network error
          throw new Error('No cached data available');
        })
    );
    return;
  }

  // For non-API requests (cache first, then network)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          // Fetch new version in background
          fetch(event.request)
            .then((fetchResponse) => {
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, fetchResponse);
                })
                .catch((err) => console.error('Failed to update cache:', err));
            })
            .catch(() => {/* Ignore fetch errors */});
          
          return response;
        }

        // If not in cache, fetch from network
        return fetch(event.request)
          .then((fetchResponse) => {
            // Cache the fetched response
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((err) => console.error('Failed to cache response:', err));
            
            return fetchResponse;
          });
      })
      .catch(() => {
        // Offline fallback
        if (event.request.destination === 'image') {
          return caches.match('/images/placeholder-image.jpg');
        }
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
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
    // Tambahkan warna background merah jika didukung (tidak semua browser support)
    // badge: '/favicon.png',
    // backgroundColor: '#d32f2f'
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

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle background sync logic here
      console.log('Service Worker: Performing background sync')
    );
  }
});

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});