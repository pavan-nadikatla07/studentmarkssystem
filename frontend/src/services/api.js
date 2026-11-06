/**
 * api.js - Centralized Resilient API Service for Examination Portal
 */

// Determine the primary API URL with smart environment detection
const getBaseApiUrl = () => {
  let url = (import.meta.env.VITE_API_URL || '').trim();

  // If explicitly configured (e.g. deployed backend on Render/Railway or custom .env)
  if (url) {
    url = url.replace(/\/+$/, '');
    if (url.startsWith('http') && !url.endsWith('/api')) {
      url = `${url}/api`;
    }
    return url;
  }

  // When running locally in browser (localhost / 127.0.0.1)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      // In local development, direct port 5000 is directly reachable and avoids proxy delays
      return 'http://localhost:5000/api';
    }
  }

  // Fallback to relative /api (works with Vite proxy or reverse proxies like Nginx)
  return '/api';
};

let CURRENT_API_BASE_URL = getBaseApiUrl();

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Safe response handler with content-type inspection
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    // If server returned HTML (e.g. 404/500 page or proxy rewrite)
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}: ${response.statusText || 'Backend service unavailable'}`);
    }
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error('Received non-JSON response from server. Please verify backend URL and server status.');
    }
  }

  if (!response.ok) {
    const errorMsg = (data && data.message) || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

// Resilient fetch wrapper with automatic local URL fallback (localhost <-> 127.0.0.1 <-> /api)
const resilientFetch = async (endpoint, options = {}) => {
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // List of candidate base URLs to try if network fails
  const candidates = [CURRENT_API_BASE_URL];

  // If in browser and running locally, add alternate local endpoints to candidates
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      ['http://localhost:5000/api', 'http://127.0.0.1:5000/api', '/api'].forEach((url) => {
        if (!candidates.includes(url)) {
          candidates.push(url);
        }
      });
    }
  }

  let lastError = null;

  for (let i = 0; i < candidates.length; i++) {
    const base = candidates[i];
    try {
      const res = await fetch(`${base}${path}`, options);
      const result = await handleResponse(res);
      // Remember the working URL for subsequent requests
      CURRENT_API_BASE_URL = base;
      return result;
    } catch (err) {
      lastError = err;
      const isConnectionError =
        err.name === 'TypeError' ||
        (err.message && err.message.toLowerCase().includes('fetch')) ||
        (err.message && err.message.toLowerCase().includes('network'));

      // If it wasn't a connection error (e.g. 400 Bad Request with validation error), don't retry candidates
      if (!isConnectionError) {
        throw err;
      }
      // If connection failed, continue to next candidate
    }
  }

  // All candidates failed
  if (lastError && (lastError.name === 'TypeError' || lastError.message?.toLowerCase().includes('fetch'))) {
    throw new Error(
      `Unable to connect to the backend server (${CURRENT_API_BASE_URL}). Please verify that your backend server is running on port 5000, or check your VITE_API_URL configuration.`
    );
  }

  throw lastError || new Error('Failed to communicate with API server');
};

// Auth API
export const authAPI = {
  login: async (email, password) => {
    return resilientFetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    return resilientFetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
  },

  getMe: async () => {
    return resilientFetch('/auth/me', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },
};

// Students API (CRUD)
export const studentAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return resilientFetch(`/students?${query}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  getById: async (id) => {
    return resilientFetch(`/students/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  create: async (data) => {
    return resilientFetch('/students', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return resilientFetch(`/students/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return resilientFetch(`/students/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};

// Results API (CRUD + Reports)
export const resultAPI = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return resilientFetch(`/results?${query}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  getById: async (id) => {
    return resilientFetch(`/results/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },

  create: async (data) => {
    return resilientFetch('/results', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return resilientFetch(`/results/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return resilientFetch(`/results/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  getSemesterReport: async (semester = '') => {
    const query = semester ? `?semester=${semester}` : '';
    return resilientFetch(`/results/reports/semester${query}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
  },
};
