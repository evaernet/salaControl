import { Platform } from 'react-native';

import { api } from '@/api/client';
import type { LoginCredentials, LoginResponse } from '@/types/auth';
import type { User } from '@/types/user';

export const authService = {
  // POST /api/login
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/login', {
      ...credentials,
      device_name: `app-${Platform.OS}`,
    });
    return data;
  },

  // GET /api/me
  async me(): Promise<User> {
    const { data } = await api.get<User>('/me');
    return data;
  },

  // POST /api/logout
  async logout(): Promise<void> {
    await api.post('/logout');
  },
};
