import { api } from '@/api/client';
import type { Aislamiento, Control, Medicacion, Paciente } from '@/types/paciente';

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

export interface DatosMedicacion {
  nombre: string;
  dosis: string;
  via: string;
  cada_horas: number;
  dias: number | null;
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

  async registrarTemperatura(id: number, temperatura: number, observacion: string): Promise<Control> {
    const { data } = await api.post<Control>(`/pacientes/${id}/controles`, { temperatura, observacion });
    return data;
  },

  async indicarMedicacion(id: number, datos: DatosMedicacion): Promise<Medicacion> {
    const { data } = await api.post<Medicacion>(`/pacientes/${id}/medicaciones`, datos);
    return data;
  },

  async suspenderMedicacion(medicacionId: number): Promise<Medicacion> {
    const { data } = await api.post<Medicacion>(`/medicaciones/${medicacionId}/suspender`);
    return data;
  },
};
