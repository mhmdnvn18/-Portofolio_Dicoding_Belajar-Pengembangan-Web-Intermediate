import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
};

export async function registerUser(name, email, password) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
  });
  return await response.json();
}

export async function loginUser(email, password) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  return await response.json();
}

export async function addStory(description, photo, token, lat = null, lon = null) {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat && lon) {
    formData.append('lat', lat);
    formData.append('lon', lon);
  }

  const response = await fetch(ENDPOINTS.STORIES, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return await response.json();
}

export async function getAllStories(token, page = 1, size = 10, location = 0) {
  const response = await fetch(`${ENDPOINTS.STORIES}?page=${page}&size=${size}&location=${location}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return await response.json();
}

export async function getStoryById(id, token) {
  const response = await fetch(`${ENDPOINTS.STORIES}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return await response.json();
}