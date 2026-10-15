import { Redirect } from 'expo-router';

import { useAuth } from '@/auth/AuthContext';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { homeDelRol } from '@/constants/roles';

// Entrada de la app: manda al login o a la pantalla del rol.
export default function Index() {
  const { status, user } = useAuth();

  if (status === 'loading') {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href={homeDelRol(user.rol)} />;
}
