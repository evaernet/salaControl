import type { Medicacion } from '@/types/paciente';

import { aFechaHora, UN_DIA } from './fechas';

const UNA_HORA = 60 * 60 * 1000;

function dosDigitos(n: number): string {
  return String(n).padStart(2, '0');
}

// Cuándo termina el tratamiento (null = sin fecha de fin).
function fin(medicacion: Medicacion): Date | null {
  if (!medicacion.dias) return null;
  return new Date(aFechaHora(medicacion.inicio).getTime() + medicacion.dias * UN_DIA);
}

export function estaActiva(medicacion: Medicacion): boolean {
  const termina = fin(medicacion);
  return !medicacion.suspendida && (!termina || termina.getTime() > Date.now());
}

// "Día 3 de 7", o "Día 3" si no tiene fecha de fin. El día que empieza es el día 1.
export function diaDeTratamiento(medicacion: Medicacion): string {
  const dia = Math.floor((Date.now() - aFechaHora(medicacion.inicio).getTime()) / UN_DIA) + 1;
  return medicacion.dias ? `Día ${dia} de ${medicacion.dias}` : `Día ${dia}`;
}

// Próximos horarios a partir de ahora: inicio, inicio + cada_horas, etc. Ej: ["20:00", "04:00"]
export function proximasDosis(medicacion: Medicacion, cantidad = 3): string[] {
  const inicio = aFechaHora(medicacion.inicio).getTime();
  const paso = medicacion.cada_horas * UNA_HORA;
  const hasta = fin(medicacion)?.getTime() ?? Infinity;

  const horarios: string[] = [];
  let numero = Math.max(0, Math.ceil((Date.now() - inicio) / paso));
  while (horarios.length < cantidad) {
    const momento = inicio + numero * paso;
    if (momento >= hasta) break;
    const fecha = new Date(momento);
    horarios.push(`${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`);
    numero++;
  }
  return horarios;
}
