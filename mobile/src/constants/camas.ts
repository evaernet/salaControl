import type { EstadoCama } from '@/types/sala';

import { colors } from './theme';

export const ESTADOS_CAMA: Record<EstadoCama, { label: string; color: string }> = {
  libre: { label: 'Libre', color: colors.success },
  limpieza: { label: 'En limpieza', color: colors.accent },
  fuera_de_servicio: { label: 'Fuera de servicio', color: colors.muted },
};

export const ESTADOS_LISTA: EstadoCama[] = ['libre', 'limpieza', 'fuera_de_servicio'];
