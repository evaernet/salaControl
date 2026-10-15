import { Stack } from 'expo-router';

import { RoleGuard } from '@/components/auth/RoleGuard';

export default function MedicoLayout() {
  return (
    <RoleGuard rol="medico">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleGuard>
  );
}
