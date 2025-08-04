import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';

export const routes = {
  '/login': async () => checkUnauthenticatedRouteOnly(new (await import('../pages/auth/login/login-page.js')).default()),
  '/register': async () => checkUnauthenticatedRouteOnly(new (await import('../pages/auth/register/register-page.js')).default()),
  '/': async () => checkAuthenticatedRoute(new (await import('../pages/home/home-page.js')).default()),
  '/new': async () => checkAuthenticatedRoute(new (await import('../pages/new/new-page.js')).default()),
  '/stories/:id': async () => checkAuthenticatedRoute(new (await import('../pages/story-detail/story-detail-page.js')).default()),
  '/bookmark': async () => checkAuthenticatedRoute(new (await import('../pages/bookmark/bookmark-page.js')).default()),
  '/offline': async () => new (await import('../pages/offline/offline-page.js')).default(),
  '*': async () => new (await import('../pages/not-found/not-found-page.js')).default(),
};