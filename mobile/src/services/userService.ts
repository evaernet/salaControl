import { api } from '@/api/client';
import type { CreateUserPayload, UpdateUserPayload, User } from '@/types/user';

// Administración de usuarios (solo administradores; la API devuelve 403 al resto).
export const userService = {
  // GET /api/users
  async list(): Promise<User[]> {
    const { data } = await api.get<User[]>('/users');
    return data;
  },

  // GET /api/users/{id}
  async get(id: string): Promise<User> {
    const { data } = await api.get<User>(`/users/${id}`);
    return data;
  },

  // POST /api/users
  async create(payload: CreateUserPayload): Promise<User> {
    const { data } = await api.post<User>('/users', payload);
    return data;
  },

  // PUT /api/users/{id}
  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await api.put<User>(`/users/${id}`, payload);
    return data;
  },
};
