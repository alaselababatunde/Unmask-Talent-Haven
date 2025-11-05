import axios from 'axios';

function normalizeApiBaseUrl(rawBase: string | undefined): string {
  const fallback = '/api';
  const base = rawBase?.trim();
  if (!base) return fallback;

  // If relative '/api' already
  if (base === '/api') return base;

  // Ensure trailing '/api' exists for absolute URLs
  try {
    const isAbsolute = /^https?:\/\//i.test(base);
    if (!isAbsolute) {
      // For any other relative path, ensure it ends with /api
      return base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
    }
    // Absolute URL
    return base.endsWith('/api') ? base : `${base.replace(/\/$/, '')}/api`;
  } catch {
    return fallback;
  }
}

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

