import { api } from '@/api/client';
import type { Cama, EstadoCama, Sala } from '@/types/sala';

export const salaService = {
  async list(): Promise<Sala[]> {
    const { data } = await api.get<Sala[]>('/salas');
    return data;
  },

  // La sala con sus camas.
  async get(id: number): Promise<Sala> {
    const { data } = await api.get<Sala>(`/salas/${id}`);
    return data;
  },

  async create(nombre: string, camas: number): Promise<Sala> {
    const { data } = await api.post<Sala>('/salas', { nombre, camas });
    return data;
  },

  async remove(id: number): Promise<void> {
    await api.delete(`/salas/${id}`);
  },

  async agregarCama(salaId: number): Promise<Cama> {
    const { data } = await api.post<Cama>(`/salas/${salaId}/camas`);
    return data;
  },

  async cambiarEstado(camaId: number, estado: EstadoCama): Promise<Cama> {
    const { data } = await api.put<Cama>(`/camas/${camaId}`, { estado });
    return data;
  },

  async quitarCama(camaId: number): Promise<void> {
    await api.delete(`/camas/${camaId}`);
  },
};
