import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
} from '../templates';
import { getAccessToken, getLogout } from '../utils/auth';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.#setupPageTransitions();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
      document.querySelector('.navigation-overlay').classList.toggle('active');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  #setupPageTransitions() {
    window.addEventListener('beforeunload', () => {
      document.body.classList.add('fade-out');
    });
  }

  #setupNavigationList() {
    if (!this.#navigationDrawer) {
      return;
    }

    const isLoggedIn = !!getAccessToken();
    const navListMain = this.#navigationDrawer.querySelector('#navlist-main');
    const navListAuth = this.#navigationDrawer.querySelector('#navlist');

    if (!navListMain || !navListAuth) {
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
    const pushNotificationToolsContainer = navigationContainer.querySelector(
      '#push-notification-tools'
    );
    if (pushNotificationToolsContainer) {
      // Logika untuk tombol subscribe/unsubscribe push notification
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    if ('startViewTransition' in document) {
      document.startViewTransition(async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      });
    } else {
      this.#content.innerHTML = await page.render();
      await page.afterRender();
    }
  }
}

export default App;
