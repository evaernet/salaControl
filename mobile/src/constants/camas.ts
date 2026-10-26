import type { Aislamiento } from '@/types/paciente';
import type { EstadoCama } from '@/types/sala';

import { colors } from './theme';

export const ESTADOS_CAMA: Record<EstadoCama, { label: string; color: string }> = {
  libre: { label: 'Libre', color: colors.success },
  limpieza: { label: 'En limpieza', color: colors.accent },
  fuera_de_servicio: { label: 'Fuera de servicio', color: colors.muted },
};

export const ESTADOS_LISTA: EstadoCama[] = ['libre', 'limpieza', 'fuera_de_servicio'];

// Precauciones de cada tipo de aislamiento: qué hace falta para entrar a la habitación.
export const AISLAMIENTOS: Record<Aislamiento, { label: string; color: string; cuidados: string }> = {
  ninguno: { label: 'Sin aislamiento', color: colors.muted, cuidados: '' },
  contacto: { label: 'Contacto', color: colors.contacto, cuidados: 'Camisolín y guantes para entrar.' },
  gotitas: { label: 'Gotitas', color: colors.gotitas, cuidados: 'Barbijo quirúrgico para entrar.' },
  aereo: { label: 'Aéreo', color: colors.aereo, cuidados: 'Barbijo N95 y puerta cerrada.' },
};

export const AISLAMIENTOS_LISTA: Aislamiento[] = ['contacto', 'gotitas', 'aereo', 'ninguno'];
