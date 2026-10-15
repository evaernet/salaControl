import type { Href } from 'expo-router';

import type { Rol } from '@/types/user';

// Nombre para mostrar y pantalla principal de cada rol.
export const ROLES: Record<Rol, { label: string; home: Href }> = {
  administrador: { label: 'Administrador', home: '/admin' },
  medico: { label: 'Médico', home: '/medico' },
  enfermero: { label: 'Enfermero', home: '/enfermero' },
};

// Orden en que aparecen en el formulario.
export const ROLES_LISTA: Rol[] = ['medico', 'enfermero', 'administrador'];

export function homeDelRol(rol: Rol): Href {
  return ROLES[rol].home;
}
