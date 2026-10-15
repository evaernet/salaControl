import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { parseApiError } from '@/api/errors';
import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Screen } from '@/components/ui/Screen';
import { UserForm, type UserFormValues } from '@/components/users/UserForm';
import { colors } from '@/constants/theme';
import { userService } from '@/services/userService';
import type { UpdateUserPayload, User } from '@/types/user';
import { confirmar } from '@/utils/confirm';
import { nombreCompleto } from '@/utils/format';

export default function EditUserScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user: usuarioActual, refreshUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    let activo = true;
    userService
      .get(id)
      .then((u) => {
        if (activo) setUser(u);
      })
      .catch((e) => {
        if (activo) setError(parseApiError(e).message);
      });
    return () => {
      activo = false;
    };
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

  async function handleSubmit(values: UserFormValues) {
    const payload: UpdateUserPayload = {
      nombre: values.nombre,
      apellido: values.apellido,
      email: values.email,
      rol: values.rol,
      activo: values.activo,
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

  async function handleDelete() {
    const ok = await confirmar(
      'Eliminar usuario',
      `¿Dar de baja a ${nombreCompleto(editado)}? No va a poder iniciar sesión. Sus registros se conservan.`,
      'Eliminar',
    );
    if (!ok) return;

    setError(null);
    setEliminando(true);
    try {
      await userService.remove(editado.id);
      router.dismissTo('/admin/users');
    } catch (e) {
      setError(parseApiError(e).message);
      setEliminando(false);
    }
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
        }}
        submitLabel="Guardar cambios"
        onSubmit={handleSubmit}
        esUsuarioActual={esUsuarioActual}
      />

      {!esUsuarioActual ? (
        <View style={styles.danger}>
          <Text style={styles.dangerTitle}>Eliminar usuario</Text>
          <Text style={styles.dangerText}>
            Deja de aparecer en el listado y no puede ingresar. Sus datos se conservan.
          </Text>
          <ErrorBanner message={error} />
          <Button title="Eliminar usuario" variant="danger" icon="trash-outline" onPress={handleDelete} loading={eliminando} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  danger: {
    marginTop: 12,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 18,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
  },
  dangerText: {
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
  },
});
