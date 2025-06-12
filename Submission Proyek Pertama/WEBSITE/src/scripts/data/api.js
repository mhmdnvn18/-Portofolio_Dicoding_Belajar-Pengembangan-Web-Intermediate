// File: src/scripts/data/api.js

import { getAccessToken } from '../utils/auth'; // Asumsi path ini benar
import { BASE_URL } from '../config'; // Asumsi path ini benar

const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,

  // Stories
  STORIES: `${BASE_URL}/stories`, // Untuk GET (all stories) dan POST (new story authenticated)
  STORIES_GUEST: `${BASE_URL}/stories/guest`, // Untuk POST (new story as guest)
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`, // Untuk GET (story detail)

  // Notifications
  SUBSCRIBE_NOTIFICATIONS: `${BASE_URL}/notifications/subscribe`, // Untuk POST (subscribe) dan DELETE (unsubscribe)
};

/**
 * Registers a new user.
 */
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

/**
 * Logs in an existing user.
 */
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

/**
 * Fetches all stories.
 */
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

/**
 * Fetches a single story by its ID.
 */
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
 * Adds a new story with authentication.
 * @param {FormData} formData - FormData object containing description, photo, and optional lat, lon.
 * @returns {Promise<object>} API response.
 *
 * NOTE: Versi ini menggunakan XMLHttpRequest (XHR) untuk tujuan debugging error "photo should be Readable".
 * Anda mungkin ingin mengembalikannya ke versi fetch nanti.
 */
export async function addNewStory(formData) { // Menerima FormData langsung dari presenter
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }

  // Log FormData sebelum dikirim (berguna untuk XHR juga)
  console.log('--- MENGIRIM FormData KE addNewStory (versi XHR) ---');
  for (let pair of formData.entries()) {
    console.log(`FormData Entry: ${pair[0]} =`, pair[1]);
    if (pair[1] instanceof File || pair[1] instanceof Blob) {
      console.log(`  (Detail File/Blob: name=${pair[1].name}, size=${pair[1].size}, type=${pair[1].type})`);
    }
  }
  console.log('-------------------------------------------------');

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', ENDPOINTS.STORIES, true);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    // Untuk FormData dengan XHR, JANGAN set Content-Type manual, biarkan XHR yang atur.
    // xhr.setRequestHeader('Content-Type', 'multipart/form-data'); // <-- JANGAN LAKUKAN INI

    xhr.onload = function () {
      let jsonResponse = {};
      try {
        jsonResponse = JSON.parse(xhr.responseText);
      } catch (e) {
        console.error("Gagal parse JSON dari respons XHR:", xhr.responseText, e);
        // Jika gagal parse, mungkin respons bukan JSON (misalnya, error HTML dari server proxy)
        // atau respons kosong.
        resolve({
          error: true,
          message: `Error: Respons server tidak valid atau bukan JSON. Status: ${xhr.status}`,
          ok: false,
          status: xhr.status
        });
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) { // Sukses
        resolve({ ...jsonResponse, ok: true, status: xhr.status });
      } else { // Error dari API (seperti 400, 401, dll.)
        resolve({ ...jsonResponse, ok: false, status: xhr.status });
      }
    };

    xhr.onerror = function () {
      // Error jaringan atau konfigurasi XHR
      console.error('XHR onerror triggered:', xhr.statusText);
      resolve({
        error: true,
        message: 'Error jaringan atau permintaan XHR gagal total.',
        ok: false,
        status: xhr.status // xhr.status mungkin 0 pada error jaringan
      });
    };

    xhr.send(formData);
  });
}

/**
 * Adds a new story as a guest (without authentication).
 */
export async function addNewStoryGuest(formData) { // Menerima FormData
  // Log FormData sebelum dikirim
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
  // Penanganan respons jika bukan JSON (misalnya saat error 400 atau 500 dengan HTML)
  let json;
  try {
    json = await fetchResponse.json();
  } catch (error) {
    const textResponse = await fetchResponse.text(); // Coba baca sebagai teks
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

/**
 * Subscribes to push notifications.
 */
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

/**
 * Unsubscribes from push notifications.
 */
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