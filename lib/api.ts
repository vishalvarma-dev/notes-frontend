const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('notes_auth_token');
  }
  return null;
}

export function setAuthToken(token: string | null) {
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('notes_auth_token', token);
    } else {
      localStorage.removeItem('notes_auth_token');
    }
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  auth: {
    login: async (email: string, password: string) => {
      const data = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (data.token) {
        setAuthToken(data.token);
      }
      return data;
    },
    register: async (name: string, email: string, password: string) => {
      const data = await fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      if (data.token) {
        setAuthToken(data.token);
      }
      return data;
    },
  },
  user: {
    getProfile: async () => {
      return fetchWithAuth('/user/profile', { method: 'GET' });
    },
    updateProfile: async (payload: { name?: string; currentPassword?: string; newPassword?: string }) => {
      return fetchWithAuth('/user/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
  },
  notes: {
    getAll: async () => {
      return fetchWithAuth('/notes', { method: 'GET' });
    },
    getOne: async (id: number) => {
      return fetchWithAuth(`/notes/${id}`, { method: 'GET' });
    },
    create: async (payload: { title: string; content: string }) => {
      return fetchWithAuth('/notes', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update: async (id: number, payload: { title: string; content: string }) => {
      return fetchWithAuth(`/notes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    delete: async (id: number) => {
      return fetchWithAuth(`/notes/${id}`, { method: 'DELETE' });
    },
  },
};

