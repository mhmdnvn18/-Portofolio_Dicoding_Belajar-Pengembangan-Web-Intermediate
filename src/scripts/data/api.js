import { getAccessToken } from '../utils/auth'; 
import { BASE_URL } from '../config';

const ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,
  STORIES: `${BASE_URL}/stories`, 
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`, 
  SUBSCRIBE_NOTIFICATIONS: `${BASE_URL}/notifications/subscribe`,
};

async function fetchWithHandling(url, options) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Gagal memproses respons server.' }));
        return { ...errorData, ok: false, status: response.status };
    }
    const json = await response.json();
    return { ...json, ok: true, status: response.status };
  } catch (error) {
    console.error('Fetch API Error:', error);
    return {
      error: true,
      message: 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
      ok: false,
      status: 0,
    };
  }
}

export async function registerUser({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });
  return fetchWithHandling(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
}

export async function loginUser({ email, password }) {
  const data = JSON.stringify({ email, password });
  return fetchWithHandling(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
}

export async function getAllStories({ page, size, location } = {}) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }

  const queryParams = new URLSearchParams();
  if (page !== undefined) queryParams.append('page', page);
  if (size !== undefined) queryParams.append('size', size);
  if (location !== undefined) queryParams.append('location', location);

  const url = `${ENDPOINTS.STORIES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return fetchWithHandling(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function getStoryById(id) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }

  return fetchWithHandling(ENDPOINTS.STORY_DETAIL(id), {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function addNewStory(formData) { 
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }

  return fetchWithHandling(ENDPOINTS.STORIES, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: formData,
  });
}

export async function subscribePushNotification({ endpoint, keys }) {
    const accessToken = getAccessToken();
    if (!accessToken) {
        return { error: true, message: 'Access token not found', ok: false, status: 401 };
    }
    const data = JSON.stringify({
        endpoint,
        keys: { p256dh: keys.p256dh, auth: keys.auth },
    });

    return fetchWithHandling(ENDPOINTS.SUBSCRIBE_NOTIFICATIONS, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: data,
    });
}

export async function unsubscribePushNotification({ endpoint }) {
    const accessToken = getAccessToken();
    if (!accessToken) {
        return { error: true, message: 'Access token not found', ok: false, status: 401 };
    }

    const data = JSON.stringify({ endpoint });
    return fetchWithHandling(ENDPOINTS.SUBSCRIBE_NOTIFICATIONS, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: data,
    });
}