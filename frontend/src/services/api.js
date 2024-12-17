import { auth } from '../firebase/config';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

const api = {
  async get(endpoint) {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  },

  async post(endpoint, data) {
    const token = await getAuthToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
    };

    // Si data es FormData, no establecer Content-Type
    // El navegador lo establecerá automáticamente con el boundary correcto
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      data = JSON.stringify(data);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data,
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  },

  async put(endpoint, data) {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  },

  async delete(endpoint) {
    const token = await getAuthToken();
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  },
};

export default api;