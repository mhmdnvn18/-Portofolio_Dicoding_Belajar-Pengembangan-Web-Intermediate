// File: src/scripts/data/api.js

import { getAccessToken } from '../utils/auth'; 
import { BASE_URL } from '../config';

const ENDPOINTS = {
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,

  STORIES: `${BASE_URL}/stories`, 
  STORIES_GUEST: `${BASE_URL}/stories/guest`, 
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`, 

  // Notifications
  SUBSCRIBE_NOTIFICATIONS: `${BASE_URL}/notifications/subscribe`,
};

export async function registerUser({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}

export async function loginUser({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
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

  const fetchResponse = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}

export async function getStoryById(id) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }

  const fetchResponse = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}

/**
 * Mengirim cerita baru ke API menggunakan Fetch API dengan FormData.
 * @param {FormData} formData - Objek FormData yang berisi data cerita (description, photo, lat, lon).
 * @returns {Promise<object>} - Respons dari API.
 */
export async function addNewStory(formData) { 
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }

  try {
    const fetchResponse = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const json = await fetchResponse.json();

    return {
      ...json,
      ok: fetchResponse.ok,
      status: fetchResponse.status,
    };
  } catch (error) {
    console.error('addNewStory fetch error:', error);
    return {
      error: true,
      message: 'Gagal terhubung ke server. Periksa koneksi internet Anda.',
      ok: false,
      status: 0,
    };
  }
}

export async function addNewStoryGuest(formData) { 
  console.log('--- MENGIRIM FormData KE addNewStoryGuest ---');
  for (let pair of formData.entries()) {
    console.log(`FormData Entry: ${pair[0]} =`, pair[1]);
    if (pair[1] instanceof File || pair[1] instanceof Blob) {
      console.log(`  (Detail File/Blob: name=${pair[1].name}, size=${pair[1].size}, type=${pair[1].type})`);
    }
  }
  console.log('------------------------------------------');

  const fetchResponse = await fetch(ENDPOINTS.STORIES_GUEST, {
    method: 'POST',
    body: formData,
  });
  let json;
  try {
    json = await fetchResponse.json();
  } catch (error) {
    const textResponse = await fetchResponse.text(); 
    console.error("addNewStoryGuest: Gagal parse JSON, respons teks:", textResponse);
    return {
      error: true,
      message: `Error server atau format respons tidak dikenal. Status: ${fetchResponse.status}. Respons: ${textResponse.substring(0,200)}`,
      ok: false,
      status: fetchResponse.status
    };
  }


  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}

export async function subscribePushNotification({ endpoint, keys }) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }
  const data = JSON.stringify({
    endpoint,
    keys: {
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATIONS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}
export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }

  const data = JSON.stringify({ endpoint });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATIONS, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}