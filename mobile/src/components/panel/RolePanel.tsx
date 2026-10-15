import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/auth/AuthContext';
import { Screen } from '@/components/ui/Screen';
import { colors, radius } from '@/constants/theme';

import { LogoutButton } from './LogoutButton';
import { PanelTitle } from './PanelTitle';
import { UserCard } from './UserCard';

// Pantalla principal del médico y del enfermero.
// En esta etapa solo muestra quién ingresó y permite salir.
export function RolePanel({ title }: { title: string }) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <Screen header={<PanelTitle title={title} />}>
      <UserCard user={user} />
      <View style={styles.note}>
        <Ionicons name="bed-outline" size={22} color={colors.brand} />
        <Text style={styles.noteText}>
          Las funciones de la sala (camas, controles, medicación) se agregan en las próximas etapas.
        </Text>
      </View>
      <LogoutButton />
    </Screen>
  );
}

const styles = StyleSheet.create({
  note: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.brandSoft,
    borderRadius: radius,
    padding: 14,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSoft,
  },
});
