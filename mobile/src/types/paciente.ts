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
  acompanante_parentesco: string | null;
  acompanante: string | null;
  acompanante_telefono: string | null;
  fecha_ingreso: string; // "2026-10-26 15:30"
  fecha_alta: string | null;
  // Avisos calculados por el servidor (fiebre, control atrasado, fin de medicación).
  alertas: string[];
  ultimo_control?: Control | null;
  controles?: Control[];
  medicaciones?: Medicacion[];
  cama?: (Cama & { sala?: Sala }) | null;
}

export interface Control {
  id: number;
  temperatura: number;
  observacion: string | null;
  fecha: string; // "2026-10-26 15:30"
  user?: { nombre: string; apellido: string } | null;
}

export interface Medicacion {
  id: number;
  nombre: string;
  dosis: string;
  via: string;
  cada_horas: number;
  dias: number | null;
  inicio: string; // "2026-10-26 15:30"
  suspendida: string | null;
}
