import { subscribePushNotification, unsubscribePushNotification } from '../data/api.js';

// VAPID public key from Dicoding API
const APPLICATION_SERVER_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

class PushNotificationHelper {
  constructor() {
    this.swRegistration = null;
    this.isSubscribed = false;
    this.pushButton = null;
  }

  // Initialize push notifications
  async init() {
    console.log('PushNotification: Initializing...');
    
    if (!('serviceWorker' in navigator)) {
      console.warn('PushNotification: Service Worker not supported');
      return false;
    }

    if (!('PushManager' in window)) {
      console.warn('PushNotification: Push messaging not supported');
      return false;
    }

    try {
      // Get existing service worker registration
      this.swRegistration = await navigator.serviceWorker.ready;
      console.log('PushNotification: Got existing Service Worker registration');

      // Update UI
      await this.updateUI();
      
      return true;
    } catch (error) {
      console.error('PushNotification: Service Worker initialization failed', error);
      return false;
    }
  }

  // Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    console.log('PushNotification: Subscribing...');
    
    try {
      const applicationServerKey = this.urlBase64ToUint8Array(APPLICATION_SERVER_KEY);
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('PushNotification: User is subscribed:', subscription);

      // Send subscription to server
      const response = await subscribePushNotification({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
        }
      });

      if (response.ok) {
        console.log('PushNotification: Subscription sent to server successfully');
        this.isSubscribed = true;
        this.saveSubscriptionToStorage(subscription);
      } else {
        console.error('PushNotification: Failed to send subscription to server', response);
        throw new Error('Failed to subscribe to server');
      }

    } catch (error) {
      console.error('PushNotification: Failed to subscribe user', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    console.log('PushNotification: Unsubscribing...');
    
    try {
      const subscription = await this.swRegistration.pushManager.getSubscription();
      
      if (subscription) {
        // Unsubscribe from server
        const response = await unsubscribePushNotification({
          endpoint: subscription.endpoint
        });

        if (response.ok) {
          console.log('PushNotification: Unsubscription sent to server successfully');
        }

        // Unsubscribe locally
        await subscription.unsubscribe();
        console.log('PushNotification: User is unsubscribed');
        
        this.isSubscribed = false;
        this.removeSubscriptionFromStorage();
      }
    } catch (error) {
      console.error('PushNotification: Failed to unsubscribe user', error);
      throw error;
    }
  }

  // Check if user is subscribed
  async checkSubscription() {
    try {
      if (!this.swRegistration) {
        await this.init();
      }

      if (!this.swRegistration) {
        console.error('PushNotification: Service Worker registration not available');
        return false;
      }

      const subscription = await this.swRegistration.pushManager.getSubscription();
      this.isSubscribed = !(subscription === null);
      
      console.log('PushNotification: User subscription status:', this.isSubscribed);
      return this.isSubscribed;
    } catch (error) {
      console.error('PushNotification: Failed to check subscription', error);
      return false;
    }
  }

  // Update UI based on subscription status
  async updateUI() {
    try {
      await this.checkSubscription();
      
      // Find push notification button container
      const pushContainer = document.getElementById('push-notification-tools');
      if (!pushContainer) return;

      if (this.isSubscribed) {
        pushContainer.innerHTML = this.getUnsubscribeButtonHTML();
        this.pushButton = document.getElementById('unsubscribe-push-button');
        this.pushButton?.addEventListener('click', () => this.handleUnsubscribeClick());
      } else {
        pushContainer.innerHTML = this.getSubscribeButtonHTML();
        this.pushButton = document.getElementById('subscribe-push-button');
        this.pushButton?.addEventListener('click', () => this.handleSubscribeClick());
      }
    } catch (error) {
      console.error('PushNotification: Failed to update UI', error);
    }
  }

  // Handle subscribe button click
  async handleSubscribeClick() {
    console.log('PushNotification: Subscribe button clicked');
    
    if (this.pushButton) {
      this.pushButton.disabled = true;
      this.pushButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Berlangganan...';
    }

    try {
      // Request notification permission
      const permission = await this.requestNotificationPermission();
      
      if (permission === 'granted') {
        await this.subscribeToPush();
        await this.updateUI();
        this.showNotification('Berhasil berlangganan notifikasi!', 'success');
      } else {
        this.showNotification('Izin notifikasi ditolak. Silakan aktifkan di pengaturan browser.', 'error');
      }
    } catch (error) {
      console.error('PushNotification: Subscribe failed', error);
      this.showNotification('Gagal berlangganan notifikasi. Silakan coba lagi.', 'error');
      await this.updateUI();
    }
  }

  // Handle unsubscribe button click
  async handleUnsubscribeClick() {
    console.log('PushNotification: Unsubscribe button clicked');
    
    if (this.pushButton) {
      this.pushButton.disabled = true;
      this.pushButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Berhenti...';
    }

    try {
      await this.unsubscribeFromPush();
      await this.updateUI();
      this.showNotification('Berhasil berhenti berlangganan notifikasi.', 'success');
    } catch (error) {
      console.error('PushNotification: Unsubscribe failed', error);
      this.showNotification('Gagal berhenti berlangganan. Silakan coba lagi.', 'error');
      await this.updateUI();
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('PushNotification: Permission status:', permission);
      return permission;
    }
    return 'denied';
  }

  // Save subscription to localStorage
  saveSubscriptionToStorage(subscription) {
    localStorage.setItem('push-subscription', JSON.stringify(subscription));
  }

  // Remove subscription from localStorage
  removeSubscriptionFromStorage() {
    localStorage.removeItem('push-subscription');
  }

  // Get subscribe button HTML
  getSubscribeButtonHTML() {
    return `
      <button id="subscribe-push-button" class="btn btn-outline">
        <i class="fas fa-bell"></i> Berlangganan Notifikasi
      </button>
    `;
  }

  // Get unsubscribe button HTML
  getUnsubscribeButtonHTML() {
    return `
      <button id="unsubscribe-push-button" class="btn btn-transparent">
        <i class="fas fa-bell-slash"></i> Berhenti Berlangganan
      </button>
    `;
  }

  // Show notification message
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#d32f2f' : type === 'error' ? '#b71c1c' : '#d32f2f'};
      color: white;
      padding: 15px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      animation: slideInRight 0.3s ease;
    `;

    // Add to document
    document.body.appendChild(notification);

    // Close button event
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      notification.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // Test push notification
  async testNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'Ini adalah notifikasi test dari BerbagiCerita',
        icon: '/favicon.png',
        badge: '/favicon.png'
      });
    }
  }
}

// Export singleton instance
const pushNotificationHelper = new PushNotificationHelper();
export default pushNotificationHelper;