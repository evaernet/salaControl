import { useAuth } from '@/auth/AuthContext';
import { TableroCamas } from '@/components/camas/TableroCamas';
import { Screen } from '@/components/ui/Screen';

import { LogoutButton } from './LogoutButton';
import { PanelTitle } from './PanelTitle';
import { UserCard } from './UserCard';

// Pantalla principal del médico y del enfermero: quién ingresó y el tablero de camas.
export function RolePanel({ title }: { title: string }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Screen header={<PanelTitle title={title} />}>
      <UserCard user={user} />
      <TableroCamas />
      <LogoutButton />
    </Screen>
  );
}
