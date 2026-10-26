import { api } from '@/api/client';
import type { Aislamiento, Paciente } from '@/types/paciente';

// Lo que se manda al internar o editar (al internar se agrega la cama).
export interface DatosPaciente {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  peso: number | null;
  diagnostico: string;
  diagnosticos_base: string;
  aislamiento: Aislamiento;
  alergias: string;
  obra_social: string;
  acompanante_parentesco: string | null;
  acompanante: string;
  acompanante_telefono: string;
}

export const pacienteService = {
  async get(id: number): Promise<Paciente> {
    const { data } = await api.get<Paciente>(`/pacientes/${id}`);
    return data;
  },

  async internar(camaId: number, datos: DatosPaciente): Promise<Paciente> {
    const { data } = await api.post<Paciente>('/pacientes', { ...datos, cama_id: camaId });
    return data;
  },

  async editar(id: number, datos: DatosPaciente): Promise<Paciente> {
    const { data } = await api.put<Paciente>(`/pacientes/${id}`, datos);
    return data;
  },

  async cambiarCama(id: number, camaId: number): Promise<Paciente> {
    const { data } = await api.post<Paciente>(`/pacientes/${id}/cambiar-cama`, { cama_id: camaId });
    return data;
  },

  async alta(id: number): Promise<Paciente> {
    const { data } = await api.post<Paciente>(`/pacientes/${id}/alta`);
    return data;
  },
};
