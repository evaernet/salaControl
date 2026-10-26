import { Redirect } from 'expo-router';
import type { ReactNode } from 'react';

import { useAuth } from '@/auth/AuthContext';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { homeDelRol } from '@/constants/roles';
import type { Rol } from '@/types/user';

interface RoleGuardProps {
  roles: Rol[];
  children: ReactNode;
}

// Sin sesión manda al login; con otro rol, a la pantalla de ese rol.
// Esto es solo navegación: los permisos de verdad los controla la API.
export function RoleGuard({ roles, children }: RoleGuardProps) {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  if (!roles.includes(user.rol)) {
    return <Redirect href={homeDelRol(user.rol)} />;
  }

  return <>{children}</>;
}
