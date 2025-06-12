// Ubah path impor CSS
import '../styles/styles.css';
import '../styles/responsives.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';

import App from './pages/app';
import Camera from './utils/camera';
import PushNotificationHelper from './utils/push-notification';
import IndexedDBHelper from './utils/indexeddb';

class BerbagiCeritaAPI {
  static async login(credentials) {
    try {
      const response = await fetch('YOUR_API_ENDPOINT/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }
}

// Service Worker Registration
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      // Force update check on registration
      const registration = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none'
      });
      console.log('ServiceWorker registration successful:', registration);
      
      // Immediately check for updates
      registration.update();
      
      // Update found
      registration.addEventListener('updatefound', () => {
        console.log('ServiceWorker update found');
        const newWorker = registration.installing;
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is available
            showUpdateNotification();
          }
        });
      });

      // Handle controller change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('ServiceWorker controller changed');
        // Reload page to ensure new service worker takes control
        window.location.reload();
      });
      
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed:', error);
      return null;
    }
  }
  return null;
}

// Show update notification
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #2c63d1;
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10001;
    display: flex;
    align-items: center;
    gap: 15px;
  `;
  
  notification.innerHTML = `
    <span>Versi aplikasi baru tersedia!</span>
    <button id="update-app" style="background: white; color: #2c63d1; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
      Update
    </button>
    <button id="dismiss-update" style="background: transparent; color: white; border: 1px solid white; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
      Nanti
    </button>
  `;
  
  document.body.appendChild(notification);
  
  // Update app
  document.getElementById('update-app').addEventListener('click', () => {
    window.location.reload();
  });
  
  // Dismiss notification
  document.getElementById('dismiss-update').addEventListener('click', () => {
    notification.remove();
  });
  
  // Auto dismiss after 10 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 10000);
}

// Initialize PWA features
async function initPWA() {
  console.log('Initializing PWA features...');
  
  // Register service worker
  await registerServiceWorker();
  
  // Initialize IndexedDB
  try {
    await IndexedDBHelper.openDB();
    console.log('IndexedDB initialized');
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
  }
  
  // Initialize push notifications
  try {
    await PushNotificationHelper.init();
    console.log('Push notifications initialized');
  } catch (error) {
    console.error('Failed to initialize push notifications:', error);
  }
  
  // Add install prompt
  window.addEventListener('beforeinstallprompt', (event) => {
    console.log('Install prompt available');
    event.preventDefault();
    window.deferredPrompt = event;
    showInstallButton();
  });
  
  // App installed
  window.addEventListener('appinstalled', (event) => {
    console.log('App installed successfully');
    hideInstallButton();
  });
}

// Show install button
function showInstallButton() {
  const existingButton = document.getElementById('install-app-button');
  if (existingButton) return;
  
  const installButton = document.createElement('button');
  installButton.id = 'install-app-button';
  installButton.className = 'btn btn-outline';
  installButton.innerHTML = '<i class="fas fa-download"></i> Install App';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  
  installButton.addEventListener('click', async () => {
    if (window.deferredPrompt) {
      window.deferredPrompt.prompt();
      const { outcome } = await window.deferredPrompt.userChoice;
      console.log('Install prompt result:', outcome);
      window.deferredPrompt = null;
      hideInstallButton();
    }
  });
  
  document.body.appendChild(installButton);
}

// Hide install button
function hideInstallButton() {
  const installButton = document.getElementById('install-app-button');
  if (installButton) {
    installButton.remove();
  }
}

// Check if app is running as PWA
function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone ||
         document.referrer.includes('android-app://');
}

export default BerbagiCeritaAPI;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('App starting...', isPWA() ? 'Running as PWA' : 'Running in browser');
  
  // Initialize PWA features
  await initPWA();
  
  // Initialize main app
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    drawerNavigation: document.getElementById('navigation-drawer'),
    skipLinkButton: document.getElementById('skip-link'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
    Camera.stopAllStreams();
  });
  
  // Handle online/offline status
  window.addEventListener('online', () => {
    console.log('App is online');
    showConnectionStatus('Online', 'success');
  });
  
  window.addEventListener('offline', () => {
    console.log('App is offline');
    showConnectionStatus('Offline - Data dari cache', 'warning');
  });
});

// Show connection status
function showConnectionStatus(message, type) {
  const status = document.createElement('div');
  status.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#4caf50' : '#ff9800'};
    color: white;
    padding: 10px 15px;
    border-radius: 4px;
    z-index: 9999;
    font-size: 14px;
  `;
  status.textContent = message;
  
  document.body.appendChild(status);
  
  setTimeout(() => {
    if (status.parentNode) {
      status.remove();
    }
  }, 3000);
}
