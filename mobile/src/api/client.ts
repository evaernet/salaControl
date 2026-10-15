import axios from 'axios';

import { API_URL } from '@/constants/config';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

let authToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

// Los usa AuthContext al iniciar y cerrar sesión.
export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
}

// Manda el token en cada petición.
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Un 401 significa que el token ya no sirve (por ejemplo, desactivaron al usuario):
// se cierra la sesión y la app vuelve al login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const esLogin = error.config?.url?.endsWith('/login');
    if (error.response?.status === 401 && !esLogin) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
