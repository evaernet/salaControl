import type { User } from './user';

export interface LoginCredentials {
  email: string;
  password: string;
}

// Respuesta de POST /api/login.
export interface LoginResponse {
  token: string;
  user: User;
}

// loading: se está recuperando la sesión guardada al abrir la app.
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
