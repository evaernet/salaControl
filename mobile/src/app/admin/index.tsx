import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';

import { useAuth } from '@/auth/AuthContext';
import { ActionCard } from '@/components/panel/ActionCard';
import { LogoutButton } from '@/components/panel/LogoutButton';
import { PanelTitle } from '@/components/panel/PanelTitle';
import { UserCard } from '@/components/panel/UserCard';
import { Screen } from '@/components/ui/Screen';
import { userService } from '@/services/userService';

export default function AdminHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [total, setTotal] = useState<number | null>(null);

  // Cuenta los usuarios cada vez que se vuelve a esta pantalla.
  useFocusEffect(
    useCallback(() => {
      userService
        .list()
        .then((usuarios) => setTotal(usuarios.length))
        .catch(() => setTotal(null));
    }, []),
  );

  if (!user) return null;

  let resumen = 'Ver, editar y activar o desactivar';
  if (total !== null) {
    resumen = total === 1 ? '1 usuario registrado' : `${total} usuarios registrados`;
  }

  return (
    <Screen header={<PanelTitle title="Panel de Administrador" />}>
      <UserCard user={user} />

      <ActionCard
        icon="people-outline"
        title="Usuarios"
        description={resumen}
        onPress={() => router.push('/admin/users')}
      />
      <ActionCard
        icon="person-add-outline"
        title="Crear usuario"
        description="Alta de médicos, enfermeros y administradores"
        onPress={() => router.push('/admin/users/create')}
      />

      <LogoutButton />
    </Screen>
  );
}
