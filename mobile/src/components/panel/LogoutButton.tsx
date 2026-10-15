import { useState } from 'react';

import { useAuth } from '@/auth/AuthContext';
import { Button } from '@/components/ui/Button';

// Al cerrar la sesión, RoleGuard manda solo al login.
export function LogoutButton() {
  const { signOut } = useAuth();
  const [saliendo, setSaliendo] = useState(false);

  async function salir() {
    setSaliendo(true);
    await signOut();
  }

  return <Button title="Cerrar sesión" variant="outline" icon="log-out-outline" loading={saliendo} onPress={salir} />;
}
