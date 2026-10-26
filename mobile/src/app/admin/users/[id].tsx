import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { parseApiError } from '@/api/errors';
import { useAuth } from '@/auth/AuthContext';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { UserForm, type UserFormValues } from '@/components/users/UserForm';
import { userService } from '@/services/userService';
import type { UpdateUserPayload, User } from '@/types/user';

// Para dar de baja a alguien se lo desactiva: no se borran usuarios.
export default function EditUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: usuarioActual, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userService
      .get(id)
      .then(setUser)
      .catch((e) => setError(parseApiError(e).message));
  }, [id]);

  if (!user) {
    return error ? (
      <Screen edges={['bottom']}>
        <ErrorBanner message={error} />
      </Screen>
    ) : (
      <LoadingScreen />
    );
  }

  const editado = user;
  const esUsuarioActual = usuarioActual?.id === editado.id;

  async function guardar(values: UserFormValues) {
    const payload: UpdateUserPayload = {
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      rol: values.rol,
      activo: values.activo,
      sala_id: values.sala_id,
    };
    if (values.password) {
      payload.password = values.password;
    }

    await userService.update(editado.id, payload);
    if (esUsuarioActual) {
      await refreshUser();
    }
    router.dismissTo('/admin/users');
  }

  return (
    <Screen edges={['bottom']}>
      <UserForm
        mode="edit"
        initialValues={{
          nombre: editado.nombre,
          apellido: editado.apellido,
          email: editado.email,
          password: '',
          rol: editado.rol,
          activo: editado.activo,
          sala_id: editado.sala_id,
        }}
        submitLabel="Guardar cambios"
        onSubmit={guardar}
        esUsuarioActual={esUsuarioActual}
      />
    </Screen>
  );
}
