import { Stack } from 'expo-router';

import { RoleGuard } from '@/components/auth/RoleGuard';

export default function EnfermeroLayout() {
  return (
    <RoleGuard rol="enfermero">
      <Stack screenOptions={{ headerShown: false }} />
    </RoleGuard>
  );
}
