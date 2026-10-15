// Roles del sistema: mismos valores que users.rol en Laravel.
export type Rol = 'administrador' | 'medico' | 'enfermero';

// Usuario tal como lo devuelve la API (UserResource).
export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
  activo: boolean;
  created_at: string | null;
  updated_at: string | null;
}

// Datos para POST /api/users.
export interface CreateUserPayload {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: Rol;
  activo?: boolean;
}

// Datos para PUT /api/users/{id}. Contraseña vacía = no se cambia.
export type UpdateUserPayload = Partial<CreateUserPayload>;
