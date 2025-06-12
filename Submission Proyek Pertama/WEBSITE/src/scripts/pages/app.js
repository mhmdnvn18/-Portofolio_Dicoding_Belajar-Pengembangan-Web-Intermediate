import { getActiveRoute } from '../routes/url-parser'; // Pastikan path ini benar
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from '../templates'; // Pastikan path ini benar
// import { setupSkipToContent, transitionHelper } from '../utils'; // transitionHelper tidak dipakai di versi ini
import { setupSkipToContent } from '../utils'; // Hanya setupSkipToContent yang dipakai dari utils standar
import { getAccessToken, getLogout } from '../utils/auth'; // Pastikan path ini benar
import { routes } from '../routes/routes'; // Pastikan path ini benar

export default class App {
  #content;
  #drawerButton;
  #drawerNavigation;
  #skipLinkButton;

  constructor({ content, drawerNavigation, drawerButton, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#drawerNavigation = drawerNavigation;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this.#setupDrawer();
    this.#setupNavigationList();
  }

  #setupDrawer() {
    if (!this.#drawerButton || !this.#drawerNavigation) {
      console.warn('Drawer button or navigation element not found, drawer functionality disabled.');
      return;
    }
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#drawerNavigation.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#drawerNavigation || !this.#drawerButton) return;

      const isTargetInsideDrawer = this.#drawerNavigation.contains(event.target);
      const isTargetInsideButton = this.#drawerButton.contains(event.target);

      if (!isTargetInsideDrawer && !isTargetInsideButton) {
        this.#drawerNavigation.classList.remove('open');
      }
    });

    this.#drawerNavigation.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (!this.#drawerNavigation) return;
        this.#drawerNavigation.classList.remove('open');
      });
    });
  }

  #setupNavigationList() {
    if (!this.#drawerNavigation) {
        console.warn('Drawer navigation element not found, cannot setup navigation list.');
        return;
    }

    const isLoggedIn = !!getAccessToken();
    const navListMain = this.#drawerNavigation.querySelector('#navlist-main');
    const navListAuth = this.#drawerNavigation.querySelector('#navlist');

    if (!navListMain || !navListAuth) {
      console.error('Elemen navigasi #navlist-main atau #navlist tidak ditemukan di dalam drawer.');
      return;
    }

    if (!isLoggedIn) {
      navListMain.innerHTML = '';
      navListAuth.innerHTML = generateUnauthenticatedNavigationListTemplate();
    } else {
      navListMain.innerHTML = generateMainNavigationListTemplate();
      navListAuth.innerHTML = generateAuthenticatedNavigationListTemplate();

      const logoutButton = navListAuth.querySelector('#logout-button');
      if (logoutButton) {
        const newLogoutButton = logoutButton.cloneNode(true);
        logoutButton.parentNode.replaceChild(newLogoutButton, logoutButton);
        
        newLogoutButton.addEventListener('click', (event) => {
          event.preventDefault();
          if (confirm('Apakah Anda yakin ingin keluar?')) {
            getLogout();
            this.#setupNavigationList();
            location.hash = '#/login';
          }
        });
      }
    }
    this.#setupPushNotificationToolsIfNeeded(navListAuth);
  }
  
  #setupPushNotificationToolsIfNeeded(navigationContainer) {
    const pushNotificationToolsContainer = navigationContainer.querySelector('#push-notification-tools');
    if (pushNotificationToolsContainer) {
      // Logika untuk tombol subscribe/unsubscribe push notification
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const routeHandlerFunction = url ? routes[url] : undefined;

    console.log(`App.renderPage: Attempting to render URL: "${url}"`); // Log dasar untuk URL

    if (!this.#content) {
      console.error('App.renderPage: Target #content element is not defined.');
      return; 
    }

    try {
      if (typeof routeHandlerFunction === 'function') {
        const pageInstance = await routeHandlerFunction();

        if (pageInstance && typeof pageInstance.render === 'function') {
          if (document.startViewTransition) {
            const transition = document.startViewTransition(async () => {
              this.#content.innerHTML = await pageInstance.render();
              if (typeof pageInstance.afterRender === 'function') {
                await pageInstance.afterRender();
              }
            });
            await transition.ready;
            await transition.updateCallbackDone;
          } else {
            this.#content.innerHTML = await pageInstance.render();
            if (typeof pageInstance.afterRender === 'function') {
              await pageInstance.afterRender();
            }
          }
          scrollTo({ top: 0, behavior: 'smooth' });
          this.#setupNavigationList();

        } else if (pageInstance === null) {
          console.log(`App.renderPage: Page instance is null for URL "${url}", likely redirected by auth guard.`);
        } else {
          console.error(`App.renderPage: Handler untuk rute "${url}" ada tapi tidak mengembalikan instance halaman yang valid:`, pageInstance);
          this.#content.innerHTML = '<h1>Error: Konfigurasi Halaman Salah</h1>';
          this.#setupNavigationList();
        }
      } else {
        console.error(`App.renderPage: Handler untuk rute "${url}" tidak ditemukan di objek routes.`);
        this.#content.innerHTML = '<h1>404 - Halaman Tidak Ditemukan</h1><p>Maaf, halaman yang Anda cari tidak ada.</p>';
        this.#setupNavigationList();
      }
    } catch (error) {
      console.error('App.renderPage: Terjadi error saat merender halaman:', error);
      this.#content.innerHTML = '<h1>Oops! Terjadi Kesalahan</h1><p>Maaf, ada masalah saat memuat halaman ini.</p>';
      this.#setupNavigationList();
    }
  }
}