import { Stack } from 'expo-router';

import { RoleGuard } from '@/components/auth/RoleGuard';
import { colors } from '@/constants/theme';

export default function AdminLayout() {
  return (
    <RoleGuard rol="administrador">
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.brand },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '700' },
          headerTitleAlign: 'center',
          headerBackTitle: 'Volver',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="users/index" options={{ title: 'Usuarios' }} />
        <Stack.Screen name="users/create" options={{ title: 'Crear usuario' }} />
        <Stack.Screen name="users/[id]" options={{ title: 'Editar usuario' }} />
        <Stack.Screen name="salas/index" options={{ title: 'Salas y camas' }} />
        <Stack.Screen name="salas/[id]" options={{ title: 'Sala' }} />
      </Stack>
    </RoleGuard>
  );
}
