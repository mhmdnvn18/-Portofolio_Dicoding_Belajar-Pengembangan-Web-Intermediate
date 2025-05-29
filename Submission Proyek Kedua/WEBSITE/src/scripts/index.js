// CSS imports
import '../styles/styles.css';

import App from './pages/app';

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });
  await app.renderPage();

  window.addEventListener('hashchange', async () => {
    await app.renderPage();
  });

  window.addEventListener('beforeunload', () => {
    document.body.classList.add('fade-out');
  });

  document.querySelector('.navigation-overlay').addEventListener('click', () => {
    document.querySelector('.navigation-drawer').classList.remove('open');
    document.querySelector('.navigation-overlay').classList.remove('active');
  });

  document.getElementById('drawer-button').addEventListener('click', () => {
    document.querySelector('.navigation-drawer').classList.add('open');
    document.querySelector('.navigation-overlay').classList.add('active');
  });
});
