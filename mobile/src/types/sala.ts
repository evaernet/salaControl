import type { Paciente } from './paciente';

// Una cama está ocupada cuando tiene paciente; el estado es para las que no lo tienen.
export type EstadoCama = 'libre' | 'limpieza' | 'fuera_de_servicio';

export interface Cama {
  id: number;
  sala_id: number;
  numero: number;
  estado: EstadoCama;
  paciente?: Paciente | null;
}

export interface Sala {
  id: number;
  nombre: string;
  camas_count?: number;
  camas?: Cama[];
}
