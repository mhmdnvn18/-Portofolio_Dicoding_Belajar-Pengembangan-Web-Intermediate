import { getActiveRoute } from '../routes/url-parser'; 
import { ACCESS_TOKEN_KEY } from '../config'; 

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    
    if (accessToken === null || accessToken === 'null' || accessToken === 'undefined') {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error('getAccessToken: error:', error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('putAccessToken: error:', error);
    return false;
  }
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    
    console.error('removeAccessToken: error:', error);
    return false;
  }
}

const unauthenticatedRoutesOnly = ['#/login', '#/register']; 


export function checkUnauthenticatedRouteOnly(pageRenderFunction) {
  const currentPath = location.hash || '#/'; 
  const isLoggedIn = !!getAccessToken();

  if (unauthenticatedRoutesOnly.includes(currentPath) && isLoggedIn) {
   
    location.hash = '#/'; 
    return null; 
  }

  return pageRenderFunction; 
}


export function checkAuthenticatedRoute(pageRenderFunction) {
  const isLoggedIn = !!getAccessToken();
  const currentPath = location.hash || '#/';

 
  if (!isLoggedIn && !unauthenticatedRoutesOnly.includes(currentPath)) {
    location.hash = '#/login'; 
    return null; 
  }

  return pageRenderFunction; 
}

export function getLogout() {
  removeAccessToken();
  
}