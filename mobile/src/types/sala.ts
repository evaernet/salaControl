// "Ocupada" todavía no existe: va a salir de los pacientes.
export type EstadoCama = 'libre' | 'limpieza' | 'fuera_de_servicio';

export interface Cama {
  id: number;
  sala_id: number;
  numero: number;
  estado: EstadoCama;
}

export interface Sala {
  id: number;
  nombre: string;
  camas_count?: number;
  camas?: Cama[];
}
