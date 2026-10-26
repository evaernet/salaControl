import { Stack } from 'expo-router';

import { RoleGuard } from '@/components/auth/RoleGuard';
import { opcionesEncabezado } from '@/constants/navegacion';

// Pantallas de la sala que comparten médico y enfermero.
export default function SalaLayout() {
  return (
    <RoleGuard roles={['medico', 'enfermero']}>
      <Stack screenOptions={opcionesEncabezado}>
        <Stack.Screen name="internar" options={{ title: 'Internar paciente' }} />
        <Stack.Screen name="paciente/[id]" options={{ title: 'Paciente' }} />
      </Stack>
    </RoleGuard>
  );
}
