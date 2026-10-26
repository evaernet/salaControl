import type { Cama, Sala } from './sala';

export type Aislamiento = 'ninguno' | 'contacto' | 'gotitas' | 'aereo';

// Una internación. fecha_alta vacía = sigue internado.
export interface Paciente {
  id: number;
  cama_id: number | null;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string; // "2022-03-10"
  peso: number | null;
  diagnostico: string;
  diagnosticos_base: string | null;
  aislamiento: Aislamiento;
  alergias: string | null;
  obra_social: string | null;
  acompanante: string | null;
  acompanante_telefono: string | null;
  fecha_ingreso: string; // "2026-10-26 15:30"
  fecha_alta: string | null;
  cama?: (Cama & { sala?: Sala }) | null;
}
