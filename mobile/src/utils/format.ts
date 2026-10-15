import type { User } from '@/types/user';

type Nombre = Pick<User, 'nombre' | 'apellido'>;

export function nombreCompleto(user: Nombre): string {
  return `${user.nombre} ${user.apellido}`.trim();
}

// "Laura Méndez" -> "LM"
export function iniciales(user: Nombre): string {
  return (user.nombre.charAt(0) + user.apellido.charAt(0)).toUpperCase();
}
